#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod commands;

use crate::db::Database;
use crate::commands::*;
use rusqlite::Connection;
use serde::Serialize;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::Manager;
use tauri::Emitter;
use thiserror::Error;

pub struct AppState {
  pub db: Database
}

#[derive(Debug, Error)]
pub enum AppError {
  #[error("Database error")]
  Database(#[from] rusqlite::Error),
  #[error("Serialization error")]
  Serialization(#[from] serde_json::Error),
  #[error("IO error")]
  Io(#[from] std::io::Error),
  #[error("Not found")]
  NotFound
}

#[derive(Serialize)]
struct ErrorMessage {
  message: String
}

impl serde::Serialize for AppError {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::Serializer,
  {
    let message = self.to_string();
    ErrorMessage { message }.serialize(serializer)
  }
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|err| std::io::Error::new(std::io::ErrorKind::Other, err.to_string()))?;
      std::fs::create_dir_all(&app_data_dir)?;
      let db_path = app_data_dir.join("prompt-library.db");
      let connection = Connection::open(&db_path)?;
      let db = Database::new(connection, db_path.to_string_lossy().to_string());
      db.migrate()?;
      db.seed()?;

      app.manage(AppState { db });

      Ok(())
    })
    .menu(|app| {
      let new_prompt = MenuItem::with_id(app, "new_prompt", "New Prompt", true, None::<&str>)?;
      let import_json = MenuItem::with_id(app, "import_json", "Import", true, None::<&str>)?;
      let export_json = MenuItem::with_id(app, "export_json", "Export", true, None::<&str>)?;
      let quit = PredefinedMenuItem::quit(app, None)?;

      let submenu = Submenu::with_items(app, "File", true, &[&new_prompt, &import_json, &export_json, &quit])?;

      Menu::with_items(app, &[&submenu])
    })
    .on_menu_event(|app, event| {
      match event.id().as_ref() {
        "new_prompt" => {
          let _ = app.emit("menu-new", ());
        }
        "import_json" => {
          let _ = app.emit("menu-import", ());
        }
        "export_json" => {
          let _ = app.emit("menu-export", ());
        }
        _ => {}
      }
    })
    .plugin(tauri_plugin_window_state::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      list_prompts,
      get_prompt,
      create_prompt,
      update_prompt,
      delete_prompt,
      duplicate_prompt,
      use_prompt,
      toggle_favorite,
      export_json,
      import_json,
      get_data_location,
      open_data_folder
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

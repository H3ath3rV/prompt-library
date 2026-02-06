use crate::db::{fetch_prompt, list_prompts as db_list_prompts, FilterState, Prompt, PromptImport, PromptInput, PromptPatch};
use crate::{AppError, AppState};
use chrono::Utc;
use rusqlite::{params, OptionalExtension};
use tauri::State;

#[tauri::command]
pub fn list_prompts(state: State<AppState>, filters: FilterState) -> Result<Vec<Prompt>, AppError> {
  let connection = state.db.connection.lock().unwrap();
  let prompts = db_list_prompts(&connection, &filters)?;
  Ok(prompts)
}

#[tauri::command]
pub fn get_prompt(state: State<AppState>, id: String) -> Result<Option<Prompt>, AppError> {
  let connection = state.db.connection.lock().unwrap();
  Ok(fetch_prompt(&connection, &id)?)
}

#[tauri::command]
pub fn create_prompt(state: State<AppState>, input: PromptInput) -> Result<Prompt, AppError> {
  let connection = state.db.connection.lock().unwrap();
  let now = Utc::now().to_rfc3339();
  let id = uuid::Uuid::new_v4().to_string();

  connection.execute(
    "INSERT INTO prompts (id, title, prompt_text, notes, author, language, category, created_at, updated_at, last_used_at, favorite, status)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
    params![
      id,
      input.title,
      input.prompt_text,
      input.notes,
      input.author,
      input.language,
      input.category,
      now,
      now,
      input.last_used_at,
      if input.favorite { 1 } else { 0 },
      input.status
    ]
  )?;

  let prompt = fetch_prompt(&connection, &id)?.ok_or(AppError::NotFound)?;
  Ok(prompt)
}

#[tauri::command]
pub fn update_prompt(state: State<AppState>, id: String, input: PromptPatch) -> Result<Prompt, AppError> {
  let connection = state.db.connection.lock().unwrap();
  let now = Utc::now().to_rfc3339();
  let current = fetch_prompt(&connection, &id)?.ok_or(AppError::NotFound)?;

  let merged_title = input.title.unwrap_or(current.title.clone());
  let merged_prompt_text = input.prompt_text.unwrap_or(current.prompt_text.clone());
  let merged_notes = input.notes.or(current.notes.clone());
  let merged_author = input.author.or(current.author.clone());
  let merged_language = input.language.or(current.language.clone());
  let merged_category = input.category.or(current.category.clone());
  let merged_last_used_at = input.last_used_at.or(current.last_used_at.clone());
  let merged_favorite = input.favorite.unwrap_or(current.favorite);
  let merged_status = input.status.unwrap_or(current.status.clone());

  connection.execute(
    "UPDATE prompts SET title = ?1, prompt_text = ?2, notes = ?3, author = ?4, language = ?5, category = ?6, updated_at = ?7, last_used_at = ?8, favorite = ?9, status = ?10 WHERE id = ?11",
    params![
      merged_title,
      merged_prompt_text,
      merged_notes,
      merged_author,
      merged_language,
      merged_category,
      now,
      merged_last_used_at,
      if merged_favorite { 1 } else { 0 },
      merged_status,
      id
    ]
  )?;

  let prompt = fetch_prompt(&connection, &id)?.ok_or(AppError::NotFound)?;
  Ok(prompt)
}

#[tauri::command]
pub fn delete_prompt(state: State<AppState>, id: String) -> Result<(), AppError> {
  let connection = state.db.connection.lock().unwrap();
  connection.execute("DELETE FROM prompts WHERE id = ?1", params![id])?;
  Ok(())
}

#[tauri::command]
pub fn duplicate_prompt(state: State<AppState>, id: String) -> Result<Prompt, AppError> {
  let connection = state.db.connection.lock().unwrap();
  let prompt = fetch_prompt(&connection, &id)?.ok_or(AppError::NotFound)?;
  let now = Utc::now().to_rfc3339();
  let new_id = uuid::Uuid::new_v4().to_string();

  connection.execute(
    "INSERT INTO prompts (id, title, prompt_text, notes, author, language, category, created_at, updated_at, last_used_at, favorite, status)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
    params![
      new_id,
      format!("{} (copy)", prompt.title),
      prompt.prompt_text,
      prompt.notes,
      prompt.author,
      prompt.language,
      prompt.category,
      now,
      now,
      prompt.last_used_at,
      if prompt.favorite { 1 } else { 0 },
      prompt.status
    ]
  )?;

  Ok(fetch_prompt(&connection, &new_id)?.ok_or(AppError::NotFound)?)
}

#[tauri::command]
pub fn use_prompt(state: State<AppState>, id: String) -> Result<(), AppError> {
  let connection = state.db.connection.lock().unwrap();
  let now = Utc::now().to_rfc3339();
  connection.execute(
    "UPDATE prompts SET last_used_at = ?1, updated_at = ?1 WHERE id = ?2",
    params![now, id]
  )?;
  Ok(())
}

#[tauri::command]
pub fn toggle_favorite(state: State<AppState>, id: String) -> Result<Prompt, AppError> {
  let connection = state.db.connection.lock().unwrap();
  let favorite: i64 = connection.query_row(
    "SELECT favorite FROM prompts WHERE id = ?1",
    params![id.clone()],
    |row| row.get(0)
  )?;
  let next = if favorite == 1 { 0 } else { 1 };
  connection.execute(
    "UPDATE prompts SET favorite = ?1, updated_at = ?2 WHERE id = ?3",
    params![next, Utc::now().to_rfc3339(), id]
  )?;
  let prompt = fetch_prompt(&connection, &id)?.ok_or(AppError::NotFound)?;
  Ok(prompt)
}


#[tauri::command]
pub fn export_json(state: State<AppState>) -> Result<String, AppError> {
  let connection = state.db.connection.lock().unwrap();
  let filters = FilterState {
    query: "".to_string(),
    category: None,
    status: "all".to_string(),
    favorite_only: false,
    sort: "newest".to_string()
  };
  let prompts = db_list_prompts(&connection, &filters)?;
  Ok(serde_json::to_string_pretty(&prompts)?)
}

#[tauri::command]
pub fn import_json(state: State<AppState>, json: String) -> Result<u32, AppError> {
  let connection = state.db.connection.lock().unwrap();
  let prompts: Vec<PromptImport> = serde_json::from_str(&json)?;
  let mut imported = 0;
  for prompt in prompts {
    let now = Utc::now().to_rfc3339();
    let id = prompt.id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let favorite = prompt.favorite.unwrap_or(false);
    let status = prompt.status.unwrap_or_else(|| "draft".to_string());
    let created_at = prompt.created_at.unwrap_or_else(|| now.clone());
    let updated_at = prompt.updated_at.unwrap_or_else(|| now.clone());

    let exists: Option<String> = connection
      .query_row(
        "SELECT id FROM prompts WHERE id = ?1",
        params![id.clone()],
        |row| row.get(0)
      )
      .optional()?;

    if exists.is_some() {
      connection.execute(
        "UPDATE prompts SET title = ?1, prompt_text = ?2, notes = ?3, author = ?4, language = ?5, category = ?6, updated_at = ?7, last_used_at = ?8, favorite = ?9, status = ?10 WHERE id = ?11",
        params![
          prompt.title,
          prompt.prompt_text,
          prompt.notes,
          prompt.author,
          prompt.language,
          prompt.category,
          updated_at,
          prompt.last_used_at,
          if favorite { 1 } else { 0 },
          status,
          id
        ]
      )?;
    } else {
      connection.execute(
        "INSERT INTO prompts (id, title, prompt_text, notes, author, language, category, created_at, updated_at, last_used_at, favorite, status)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
          id,
          prompt.title,
          prompt.prompt_text,
          prompt.notes,
          prompt.author,
          prompt.language,
          prompt.category,
          created_at,
          updated_at,
          prompt.last_used_at,
          if favorite { 1 } else { 0 },
          status
        ]
      )?;
    }

    imported += 1;
  }

  Ok(imported)
}

#[tauri::command]
pub fn get_data_location(state: State<AppState>) -> Result<String, AppError> {
  Ok(state.db.path.clone())
}

#[tauri::command]
pub fn open_data_folder(state: State<AppState>) -> Result<(), AppError> {
  let path = std::path::Path::new(&state.db.path);
  if let Some(parent) = path.parent() {
    std::process::Command::new("open").arg(parent).spawn()?;
  }
  Ok(())
}

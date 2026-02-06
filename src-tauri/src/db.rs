use rusqlite::{params, params_from_iter, Connection, OptionalExtension, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use chrono::Utc;

pub struct Database {
  pub connection: Mutex<Connection>,
  pub path: String
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Prompt {
  pub id: String,
  pub title: String,
  pub prompt_text: String,
  pub notes: Option<String>,
  pub author: Option<String>,
  pub language: Option<String>,
  pub category: Option<String>,
  pub created_at: String,
  pub updated_at: String,
  pub last_used_at: Option<String>,
  pub favorite: bool,
  pub status: String
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PromptImport {
  pub id: Option<String>,
  pub title: String,
  pub prompt_text: String,
  pub notes: Option<String>,
  pub author: Option<String>,
  pub language: Option<String>,
  pub category: Option<String>,
  pub created_at: Option<String>,
  pub updated_at: Option<String>,
  pub last_used_at: Option<String>,
  pub favorite: Option<bool>,
  pub status: Option<String>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PromptInput {
  pub title: String,
  pub prompt_text: String,
  pub notes: Option<String>,
  pub author: Option<String>,
  pub language: Option<String>,
  pub category: Option<String>,
  pub favorite: bool,
  pub status: String,
  pub last_used_at: Option<String>
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct PromptPatch {
  pub title: Option<String>,
  pub prompt_text: Option<String>,
  pub notes: Option<String>,
  pub author: Option<String>,
  pub language: Option<String>,
  pub category: Option<String>,
  pub favorite: Option<bool>,
  pub status: Option<String>,
  pub last_used_at: Option<String>
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FilterState {
  pub query: String,
  pub category: Option<String>,
  pub status: String,
  pub favorite_only: bool,
  pub sort: String
}

impl Database {
  pub fn new(connection: Connection, path: String) -> Self {
    Self {
      connection: Mutex::new(connection),
      path
    }
  }

  pub fn migrate(&self) -> SqlResult<()> {
    let connection = self.connection.lock().unwrap();

    connection.execute_batch("PRAGMA foreign_keys = ON;")?;
    // Drop legacy tag tables if they exist
    connection.execute_batch("DROP TABLE IF EXISTS prompt_tags; DROP TABLE IF EXISTS tags;")?;

    // Migrate prompts table to remove legacy columns if needed
    let mut stmt = connection.prepare("PRAGMA table_info(prompts)")?;
    let columns = stmt
      .query_map([], |row| row.get::<_, String>(1))?
      .collect::<Result<Vec<String>, _>>()?;

    if columns.contains(&"source".to_string()) || columns.contains(&"source_url".to_string()) {
      connection.execute_batch(
        "CREATE TABLE prompts_new (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          prompt_text TEXT NOT NULL,
          notes TEXT,
          author TEXT,
          language TEXT,
          category TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          last_used_at TEXT,
          favorite INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'draft'
        );
        INSERT INTO prompts_new (id, title, prompt_text, notes, author, language, category, created_at, updated_at, last_used_at, favorite, status)
          SELECT id, title, prompt_text, notes, author, language, category, created_at, updated_at, last_used_at, favorite, status FROM prompts;
        DROP TABLE prompts;
        ALTER TABLE prompts_new RENAME TO prompts;"
      )?;
    }

    connection.execute_batch(
      "CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        prompt_text TEXT NOT NULL,
        notes TEXT,
        author TEXT,
        language TEXT,
        category TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_used_at TEXT,
        favorite INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'draft'
      );"
    )?;

    // Ensure legacy rows get a default category for filtering
    connection.execute("UPDATE prompts SET category = \"Writing\" WHERE category IS NULL OR category = \"\"", [])?;

    Ok(())
  }

  pub fn seed(&self) -> SqlResult<()> {
    let connection = self.connection.lock().unwrap();
    let count: i64 = connection.query_row("SELECT COUNT(*) FROM prompts", [], |row| row.get(0))?;
    if count > 0 {
      return Ok(());
    }

    let now = Utc::now().to_rfc3339();
    let samples = vec![
      (
        "Write a product strategy memo for a new feature. Include risks, metrics, and rollout plan.",
        "Strategy Memo"
      ),
      (
        "Rewrite this paragraph in the voice of a calm, concise UX writer. Provide 3 options.",
        "UX rewrite"
      ),
      (
        "Summarize this podcast episode into 5 actionable takeaways for founders.",
        "Podcast recap"
      )
    ];

    for (prompt_text, title) in samples {
      let id = uuid::Uuid::new_v4().to_string();
      connection.execute(
        "INSERT INTO prompts (id, title, prompt_text, created_at, updated_at, favorite, status) VALUES (?1, ?2, ?3, ?4, ?5, 0, 'ready')",
        params![id, title, prompt_text, now, now]
      )?;

    }

    Ok(())
  }
}


pub fn fetch_prompt(connection: &Connection, prompt_id: &str) -> SqlResult<Option<Prompt>> {
  let prompt: Option<Prompt> = connection
    .query_row(
      "SELECT id, title, prompt_text, notes, author, language, category, created_at, updated_at, last_used_at, favorite, status
       FROM prompts WHERE id = ?1",
      params![prompt_id],
      |row| {
        Ok(Prompt {
          id: row.get(0)?,
          title: row.get(1)?,
          prompt_text: row.get(2)?,
          notes: row.get(3)?,
          author: row.get(4)?,
          language: row.get(5)?,
          category: row.get(6)?,
          created_at: row.get(7)?,
          updated_at: row.get(8)?,
          last_used_at: row.get(9)?,
          favorite: row.get::<_, i64>(10)? == 1,
          status: row.get(11)?
        })
      }
    )
    .optional()?;

  Ok(prompt)
}

pub fn list_prompts(connection: &Connection, filters: &FilterState) -> SqlResult<Vec<Prompt>> {
  let mut conditions: Vec<String> = Vec::new();
  let mut params_vec: Vec<String> = Vec::new();

  if !filters.query.trim().is_empty() {
    conditions.push("(title LIKE ? OR prompt_text LIKE ? OR notes LIKE ?)".to_string());
    let like = format!("%{}%", filters.query.trim());
    params_vec.push(like.clone());
    params_vec.push(like.clone());
    params_vec.push(like);
  }

  if let Some(category) = &filters.category {
    conditions.push("category = ?".to_string());
    params_vec.push(category.clone());
  }

  if filters.status != "all" {
    conditions.push("status = ?".to_string());
    params_vec.push(filters.status.clone());
  }

  if filters.favorite_only {
    conditions.push("favorite = 1".to_string());
  }

  let mut query = String::from(
    "SELECT prompts.id, prompts.title, prompts.prompt_text, prompts.notes, prompts.author, prompts.language, prompts.category, prompts.created_at, prompts.updated_at, prompts.last_used_at, prompts.favorite, prompts.status
     FROM prompts"
  );

  if !conditions.is_empty() {
    query.push_str(" WHERE ");
    query.push_str(&conditions.join(" AND "));
  }


  match filters.sort.as_str() {
    "recent" => query.push_str(" ORDER BY prompts.last_used_at IS NULL, prompts.last_used_at DESC"),
    "favorites" => query.push_str(" ORDER BY prompts.favorite DESC, prompts.created_at DESC"),
    _ => query.push_str(" ORDER BY prompts.created_at DESC")
  }

  let mut stmt = connection.prepare(&query)?;
  let rows = stmt.query_map(params_from_iter(params_vec), |row| {
    Ok(Prompt {
      id: row.get(0)?,
      title: row.get(1)?,
      prompt_text: row.get(2)?,
      notes: row.get(3)?,
      author: row.get(4)?,
      language: row.get(5)?,
      category: row.get(6)?,
      created_at: row.get(7)?,
      updated_at: row.get(8)?,
      last_used_at: row.get(9)?,
      favorite: row.get::<_, i64>(10)? == 1,
      status: row.get(11)?
    })
  })?;

  let mut prompts = Vec::new();
  for prompt in rows {
    prompts.push(prompt?);
  }

  Ok(prompts)
}

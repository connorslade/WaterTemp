use std::fs;

/// Config Struct
pub struct Config {
    pub file: String,
    data: Vec<[String; 2]>,
}

/// Some errors that can be thrown
pub enum ConfigError {
    /// Error reading the file from disk
    FileReadError,
    /// File path has not been defined
    NoFileDefined,
    /// The config data is not valid
    InvalidConfig,
}

/// Config Implementation
impl Config {
    /// Default Config
    /// ```rust
    /// // Load config from file
    /// let mut cfg = config::Config::new(Some("config.ini"));
    /// // Let you load config from string with cfg.parse(...)
    /// let mut cfg = config::Config::new(None);
    /// ```
    pub fn new(file: Option<&str>) -> Self {
        let file = file.unwrap_or("");
        Config {
            file: file.to_string(),
            data: vec![],
        }
    }

    /// Reads the config file and parses it
    /// ```rust
    /// // Example Code
    /// let mut cfg = config::Config::new(Some("config.cfg"));
    /// cfg.read().ok().unwrap();
    /// println!("Hello: {}", cfg.get("hello"))
    /// ```
    pub fn read(&mut self) -> Result<Vec<[String; 2]>, ConfigError> {
        if self.file.is_empty() {
            return Err(ConfigError::NoFileDefined);
        }
        let mut contents = match fs::read_to_string(&self.file) {
            Ok(contents) => contents,
            Err(_) => return Err(ConfigError::FileReadError),
        };
        contents = contents.replace('\r', "");
        self.parse(&contents[..])
    }

    /// Parse a string as a config file
    /// ```rust
    /// // Example Code
    /// let mut cfg = config::Config::new(None);
    /// cfg.parse("hello = world\nrust = is great").ok().unwrap();
    /// println!("Hello: {}", cfg.get("hello"))
    /// ```
    pub fn parse(&mut self, input_data: &str) -> Result<Vec<[String; 2]>, ConfigError> {
        let data = input_data.to_string();
        let mut done: Vec<[String; 2]> = Vec::new();

        for line in data.split('\n') {
            if line.starts_with('#') {
                continue;
            }
            let parts: Vec<&str> = line.split('=').collect();
            if parts.len() != 2 {
                return Err(ConfigError::InvalidConfig);
            }
            let key = parts[0].replace(" ", "");
            let mut value = parts[1].to_string();

            while value.starts_with(' ') {
                value = value[1..value.len()].to_string();
            }

            done.push([key, value]);
        }
        self.data = done.clone();
        Ok(done)
    }

    /// Gets a value from the config
    /// ```rust
    /// cfg.get("key")
    /// ```
    pub fn get(&self, key: &str) -> String {
        for i in self.data.iter() {
            if i[0] == key {
                return i[1].to_string();
            }
        }
        "".to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use std::io::prelude::*;
    #[test]
    /// Test parsing a config string
    fn test_config_from_string() {
        let mut cfg = Config::new(None);
        cfg.parse("hello = world\nrust = is great\ntest = \"TEST\"")
            .ok()
            .unwrap();

        assert_eq!(cfg.get("hello"), "world");
        assert_eq!(cfg.get("rust"), "is great");
        assert_eq!(cfg.get("test"), "\"TEST\"");
    }

    #[test]
    /// Test loading and parsing a config file
    fn test_config_from_file() {
        // Create a conf file
        let mut file = File::create("config.cfg").unwrap();
        file.write_all(b"hello = world\n\rrust = is great\n\rtest = \"TEST\"")
            .unwrap();

        let mut cfg = Config::new(Some("config.cfg"));
        cfg.read().ok().unwrap();

        assert_eq!(cfg.get("hello"), "world");
        assert_eq!(cfg.get("rust"), "is great");
        assert_eq!(cfg.get("test"), "\"TEST\"");

        // Remove temporary config file
        fs::remove_file("config.cfg").unwrap();
    }
}

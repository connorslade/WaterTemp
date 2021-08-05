use regex::Regex;

/// Return string with ANSI color codes
pub fn color(text: &str, color: i32) -> String {
    ["\x1B[0;", &color.to_string()[..], "m", text, "\x1B[0;0m"].join("")
}

/// Return string with ANSI color codes for bold text
pub fn color_bold(text: &str, color: i32) -> String {
    ["\x1B[1;", &color.to_string()[..], "m", text, "\x1B[0;0m"].join("")
}

/// Removes ANSI color codes from text
pub fn remove_ansi(text: &str) -> String {
    let re = Regex::new(r"\[[0-1];[0-9]+m").unwrap();
    re.replace_all(text, "").to_string()
}

/// Removes any whitespace from before and after a string
///
/// EX: "  hello  " -> "hello"
pub fn remove_whitespace(mut value: String) -> String {
    // Remove any leading spaces
    while value.starts_with(' ') {
        value = value[1..value.len()].to_string();
    }

    // Remove any trailing spaces
    while value.ends_with(' ') {
        value = value[..value.len() - 1].to_string();
    }
    value
}

pub fn ret_if(cond: bool, ret: String) -> String {
    if cond {
        return ret;
    }
    "".to_string()
}

// COLORS
// ------------
// BLACK   - 30
// RED     - 31
// GREEN   - 32
// YELLOW  - 33
// BLUE    - 34
// MAGENTA - 35
// CYAN    - 36
// WHITE   - 37
// RESET   - 0

#[allow(dead_code)]
/// Get the type of a value
pub fn get_type<T>(_: &T) -> String {
    std::any::type_name::<T>().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_color_1() {
        assert_eq!(color("Hello", 32), "\x1B[0;32mHello\x1B[0;0m");
    }

    #[test]
    fn test_color_bold_1() {
        assert_eq!(color_bold("Hello", 32), "\x1B[1;32mHello\x1B[0;0m")
    }

    #[test]
    fn test_get_type_1() {
        assert_eq!(get_type(&1), "i32");
    }

    #[test]
    fn test_remove_whitespace_1() {
        assert_eq!(remove_whitespace("  hello  ".to_string()), "hello");
    }

    #[test]
    fn test_remove_ansi_1() {
        assert_eq!(remove_ansi("\x1B[0;32mHello\x1B[0;0m"), "Hello");
        assert_eq!(remove_ansi(&color("Nose", 36)), "Nose");
    }

    #[test]
    fn test_ret_if_1() {
        assert_eq!(ret_if(true, "Hello".to_string()), "Hello".to_string());
    }
}

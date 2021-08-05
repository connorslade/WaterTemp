use regex::Regex;

/// Define Text Colors
#[allow(dead_code)]
pub enum Color {
    Black,
    Red,
    Green,
    Yellow,
    Blue,
    Magenta,
    Cyan,
    White,
    Reset,
}

/// Get Color as an Integer.
/// Using Ansi Color Codes.
#[rustfmt::skip]
fn get_color_code(color: Color) -> i32 {
    match color {
        Color::Black   => 30,
        Color::Red     => 31,
        Color::Green   => 32,
        Color::Yellow  => 33,
        Color::Blue    => 34,
        Color::Magenta => 35,
        Color::Cyan    => 36,
        Color::White   => 37,
        Color::Reset   => 0,
    }
}

/// Return string with ANSI color codes
pub fn color(text: &str, color: Color) -> String {
    format!("\x1B[0;{}m{}\x1B[0;0m", get_color_code(color), text)
}

/// Return string with ANSI color codes for bold text
pub fn color_bold(text: &str, color: Color) -> String {
    format!("\x1B[1;{}m{}\x1B[0m", get_color_code(color), text)
}

/// Removes ANSI color codes from text
pub fn remove_ansi(text: &str) -> String {
    let re = Regex::new(r"\x1B\[[0-1];[0-9]+m").unwrap();
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
        assert_eq!(color("Hello", Color::Green), "\x1B[0;32mHello\x1B[0;0m");
    }

    #[test]
    fn test_color_bold_1() {
        assert_eq!(color_bold("Hello", Color::Green), "\x1B[1;32mHello\x1B[0m")
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
        assert_eq!(remove_ansi(&color("Nose", Color::Cyan)), "Nose");
    }

    #[test]
    fn test_ret_if_1() {
        assert_eq!(ret_if(true, "Hello".to_string()), "Hello".to_string());
    }

    #[test]
    fn test_ret_if_2() {
        assert_eq!(ret_if(false, "Hello".to_string()), "".to_string());
    }
}

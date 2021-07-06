pub fn color(text: &str, color: i32) -> String {
    return ["\x1B[0;", &color.to_string()[..], "m", text, "\x1B[0;0m"].join("");
}

pub fn color_bold(text: &str, color: i32) -> String {
    return ["\x1B[1;", &color.to_string()[..], "m", text, "\x1B[0;0m"].join("");
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
}
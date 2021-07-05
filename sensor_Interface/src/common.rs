pub fn color(text: &str, color: i32) -> String {
    return ["\x1B[0;", &color.to_string()[..], "m", text, "\x1B[0;0m"].join("");
}

pub fn color_bold(text: &str, color: i32) -> String {
    return ["\x1B[1;", &color.to_string()[..], "m", text, "\x1B[0;0m"].join("");
}

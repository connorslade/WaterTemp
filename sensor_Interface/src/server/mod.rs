use tiny_http::{Response, Server};

mod routes;
mod sensor;

pub fn init(ip: &str, port: u32) -> tiny_http::Server {
    let address: String = format!("{}:{}", ip, port);
    let server = Server::http(address).unwrap();
    return server;
}

pub fn start(server: tiny_http::Server) {
    for request in server.incoming_requests() {
        let res: String;

        match request.url() {
            "/temp" => res = routes::get_temp(&request),
            _ => res = routes::not_found(&request)
        }

        let response = Response::from_string(res);
        let _ = request.respond(response);
    }
}

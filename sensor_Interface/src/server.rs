use tiny_http::{Response, Server};

mod sensor;

pub fn init(ip: &str, port: u32) {
    let server = Server::http("0.0.0.0:3030").unwrap();

    for request in server.incoming_requests() {
        println!(
            "received request! method: {:?}, url: {:?}, headers: {:?}",
            request.method(),
            request.url(),
            request.headers()
        );

        let temp: u8 = sensor::get_temperature();
        let response = Response::from_string(temp.to_string());
        let _ = request.respond(response);
    }
}

//pub fn start_server(server: server) {
    
//}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Test API
    if (url.pathname === "/api/auth") {
      return new Response(
        JSON.stringify({
          ok: true,
          message: "Worker API aktif"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Website sementara
    return new Response(
      "Wedding Page Worker aktif.",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        }
      }
    );
  }
};

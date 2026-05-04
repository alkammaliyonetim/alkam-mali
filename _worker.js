export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    return response;
  }
};

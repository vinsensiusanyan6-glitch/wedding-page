const COOKIE = "wedding_admin";
const MAX_AGE = 60 * 60 * 12;

const ADMIN_USER = "anyanadmin";
const ADMIN_PASSWORD = "anyan96";

export async function onRequestGet({ request, env }) {
const authenticated = await verifySession(request, env);

return json({
authenticated: authenticated
});
}

export async function onRequestPost({ request, env }) {
const body = await request.json().catch(function () {
return {};
});

const username = String(body.username || "").trim();
const password = String(body.password || "");

if (!env.SESSION_SECRET) {
return json(
{
error: "SESSION_SECRET belum dikonfigurasi di Cloudflare."
},
503
);
}

if (username !== ADMIN_USER) {
return json(
{
error: "Username atau password salah."
},
401
);
}

if (password !== ADMIN_PASSWORD) {
return json(
{
error: "Username atau password salah."
},
401
);
}

const expires =
Math.floor(Date.now() / 1000) + MAX_AGE;

const payload =
ADMIN_USER + "|" + expires;

const signature =
await sign(
payload,
env.SESSION_SECRET
);

const token =
b64url(payload) + "." + signature;

return new Response(
JSON.stringify({
ok: true
}),
{
status: 200,
headers: {
"Content-Type": "application/json",
"Cache-Control": "no-store",
"Set-Cookie":
COOKIE +
"=" +
token +
"; Path=/; Max-Age=" +
MAX_AGE +
"; HttpOnly; Secure; SameSite=Strict"
}
}
);
}

export async function onRequestDelete() {
return new Response(
JSON.stringify({
ok: true
}),
{
status: 200,
headers: {
"Content-Type": "application/json",
"Cache-Control": "no-store",
"Set-Cookie":
COOKIE +
"=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"
}
}
);
}

export async function verifySession(request, env) {
if (!env.SESSION_SECRET) {
return false;
}

const cookie =
request.headers.get("Cookie") || "";

const match = cookie.match(
new RegExp(COOKIE + "=([^;]+)")
);

if (!match) {
return false;
}

const token = match[1];
const parts = token.split(".");

if (parts.length !== 2) {
return false;
}

let payload;

try {
payload = unb64url(parts[0]);
} catch (error) {
return false;
}

const data = payload.split("|");

const username = data[0];
const expires = Number(data[1]);

if (username !== ADMIN_USER) {
return false;
}

if (!expires) {
return false;
}

if (expires < Math.floor(Date.now() / 1000)) {
return false;
}

const expected =
await sign(
payload,
env.SESSION_SECRET
);

return timingSafeEqual(
parts[1],
expected
);
}

async function sign(value, secret) {
const key =
await crypto.subtle.importKey(
"raw",
new TextEncoder().encode(secret),
{
name: "HMAC",
hash: "SHA-256"
},
false,
["sign"]
);

const signature =
await crypto.subtle.sign(
"HMAC",
key,
new TextEncoder().encode(value)
);

return bytesToB64Url(
new Uint8Array(signature)
);
}

function timingSafeEqual(a, b) {
if (a.length !== b.length) {
return false;
}

let result = 0;

for (let i = 0; i < a.length; i++) {
result |=
a.charCodeAt(i) ^
b.charCodeAt(i);
}

return result === 0;
}

function bytesToB64Url(bytes) {
let binary = "";

for (let i = 0; i < bytes.length; i++) {
binary += String.fromCharCode(bytes[i]);
}

return btoa(binary)
.replace(/\+/g, "-")
.replace(/\//g, "_")
.replace(/=+$/, "");
}

function b64url(value) {
return bytesToB64Url(
new TextEncoder().encode(value)
);
}

function unb64url(value) {
let padded =
value
.replace(/-/g, "+")
.replace(/_/g, "/");

while (padded.length % 4 !== 0) {
padded += "=";
}

const binary = atob(padded);

const bytes =
new Uint8Array(binary.length);

for (let i = 0; i < binary.length; i++) {
bytes[i] = binary.charCodeAt(i);
}

return new TextDecoder().decode(bytes);
}

function json(data, status = 200) {
return new Response(
JSON.stringify(data),
{
status: status,
headers: {
"Content-Type": "application/json",
"Cache-Control": "no-store"
}
}
);
}

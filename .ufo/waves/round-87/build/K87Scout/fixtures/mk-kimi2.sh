set -e
R=$1; DROP=$2
rm -rf "$R"; mkdir -p "$R"
cd "$R"
printf 'x\n' > config.toml; printf 'x\n' > tui.toml; printf 'x\n' > config.toml.bak
printf 'x\n' > mcp.json; chmod 0600 mcp.json
mkdir -p agents/secondary
for n in sec-fast-hyper-ds-flash sec-fast-hyper-glm-flash sec-fast-tp1-ds-flash sec-fast-tp2-ds-flash sec-fast-tp3-ds-flash sec-fast-zai-flash-low sec-fast-zai-flash sec-mid-hyper-qwen-flash sec-mid-tp1-qwen-flash sec-mid-tp2-qwen-flash sec-mid-tp3-qwen-flash sec-mid-zai-glm-5-turbo sec-strong-hyper-qwen-max sec-strong-tp1-qwen-max sec-strong-tp1-qwen-max-xhigh sec-strong-tp2-qwen-max sec-strong-tp3-qwen-max sec-strong-zai-glm-53; do printf 'x\n' > "agents/secondary/$n.md"; done
mkdir -p skills
for n in cursor-lane godspeed kimi-webbridge reverse-engineer-anything shokunin ufo wwkd; do mkdir -p "skills/$n"; done
mkdir -p plugins/managed/kimi-shokunin plugins/managed/kimi-webbridge
printf 'x\n' > plugins/installed.json; printf 'x\n' > plugins/installed.json.bak-pre-shokunin
mkdir -p locks; chmod 0700 locks
mkdir -p sessions workspace-trust telemetry file-history user-history cache search-index
printf 'x\n' > session_index.jsonl
mkdir -p logs; printf 'x\n' > logs/kimi-code.log
mkdir -p bin; printf 'x\n' > bin/kimi; [ "$DROP" = "fd" ] || printf 'x\n' > bin/fd
mkdir -p updates server
printf 'x\n' > server.token; chmod 0600 server.token
printf 'x\n' > device_id; printf 'x\n' > region
mkdir -p credentials; chmod 0700 credentials
mkdir -p oauth; chmod 0755 oauth
printf 'x\n' > workspaces.json; printf 'x\n' > tui.toml.bak; printf 'x\n' > rc-qrcode.png

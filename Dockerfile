FROM node:20-alpine
WORKDIR /app
COPY server.js package.json ./
COPY public ./public
COPY data ./data
ENV HOST=0.0.0.0 PORT=8080
EXPOSE 8080
# NOTE: no auth built in — front this with an authenticating proxy before exposing real data.
CMD ["node", "server.js"]

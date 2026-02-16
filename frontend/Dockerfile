FROM node:22-alpine

WORKDIR /app

# Install dependencies during image build so container startup does not depend on network.
COPY package.json ./
RUN npm install --no-audit --no-fund \
  && cp -R node_modules /opt/node_modules

EXPOSE 5173

# The app code is mounted by docker-compose for fast iteration (HMR).
CMD ["sh", "-c", "if [ ! -d /app/node_modules ] || [ -z \"$(ls -A /app/node_modules 2>/dev/null)\" ]; then cp -R /opt/node_modules /app/node_modules; fi && npm run dev -- --host 0.0.0.0 --port 5173"]

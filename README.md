# ChatX

## To run code (dev) -
- Update `.env`
- Run `npm i`
- Run `docker compose up -d`
- If any __DB changes__ or __first time pull__ run - `npm run db:generate` and then `npm run db:migrate`.
- Then finally run - `npm run dev`.

## To run code (production) -
- Update `.env`
- Run `npm i`
- Run `docker compose up -d`
- If any __DB changes__ or __first time pull__ run - `npm run db:generate` and then `npm run db:migrate`.
- Then finally run - `npm run build` then `npm run start`.

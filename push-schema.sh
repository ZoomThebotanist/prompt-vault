#!/bin/bash
export $(grep -v '^#' .env.local | xargs)
npx drizzle-kit push

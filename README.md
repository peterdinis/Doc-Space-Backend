# doc-space Backend

<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

A backend API built with [NestJS](https://nestjs.com/), powering **doc-space** — a collaborative document editor inspired by Google Docs, with features including authentication, document management, sharing, and user connections.

## Features

- **User Authentication** — secure registration, login, and session management
- **Document Management** — create, update, delete, and fetch documents
- **Document Sharing** — share documents with other users with granular permissions
- **User Connections** — manage relationships between users to enable collaboration and sharing
- **Real-time Collaboration Support** (optional integration)
- RESTful API built with TypeScript and NestJS for scalability and maintainability

## Project Setup

Install dependencies using pnpm:

```bash
pnpm install

# Development mode
pnpm run start:dev

# Production mode
pnpm run start:prod

# Unit tests
pnpm run test

# End-to-end tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
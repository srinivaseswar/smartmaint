import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';

import app from '../server.js';

const base = '/api/auth';

test('login route is public', async () => {
  const res = await request(app)
    .post(`${base}/login`)
    .send({ email: 'user@example.com', password: 'password123' });

  assert.notEqual(res.status, 401);
});

test('me route requires auth', async () => {
  const res = await request(app).get(`${base}/me`);

  assert.equal(res.status, 401);
  assert.equal(res.body.message, 'Authentication required');
});

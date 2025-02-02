const request = require('supertest');
const { sequelize, Alert, User } = require('../src/models'); 
const { buildServer } = require('../src/index'); 

let app;
let server;
let authToken;

describe('Alerts Integration Tests', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    app = await buildServer();
    server = app.server; 

    const user = await User.create({
      email: 'test@example.com',
      password: 'hashedPassword',
    });
    
    authToken = app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '1h' });
  });

  afterAll(async () => {
    if (app) await app.close();
    await sequelize.close();
  });

  describe('POST /alerts - create different alerts', () => {
    it('should create an alert with conditionType=above', async () => {
      const res = await request(server)
        .post('/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'BTC',
          conditionType: 'above',
          threshold: 30000,
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.symbol).toBe('BTC');
      expect(res.body.conditionType).toBe('above');
      expect(res.body.threshold).toBe(30000);
    });

    it('should create an alert with conditionType=below', async () => {
      const res = await request(server)
        .post('/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'BTC',
          conditionType: 'below',
          threshold: 20000,
        });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.conditionType).toBe('below');
    });

    it('should create an alert with conditionType=range', async () => {
      const res = await request(server)
        .post('/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'ETH',
          conditionType: 'range',
          rangeLow: 1000,
          rangeHigh: 1500,
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.symbol).toBe('ETH');
      expect(res.body.conditionType).toBe('range');
      expect(res.body.rangeLow).toBe(1000);
      expect(res.body.rangeHigh).toBe(1500);
    });

    it('should create an alert with conditionType=percentage_drop', async () => {
      const res = await request(server)
        .post('/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'ETH',
          conditionType: 'percentage_drop',
          percentChange: 10,
          timeWindow: '24h'
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.conditionType).toBe('percentage_drop');
      expect(res.body.percentChange).toBe(10);
    });

    it('should fail if required fields are missing', async () => {
      const res = await request(server)
        .post('/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'BTC',
          conditionType: 'above'
        });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /alerts', () => {
    it('should get all alerts for the user', async () => {
      const res = await request(server)
        .get('/alerts')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('DELETE /alerts/:id', () => {
    it('should delete an alert by id', async () => {
      const creation = await request(server)
        .post('/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'BTC',
          conditionType: 'above',
          threshold: 35000,
        });
      const alertId = creation.body.id;
      expect(alertId).toBeDefined();

      const deletion = await request(server)
        .delete(`/alerts/${alertId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(deletion.statusCode).toBe(200);
      expect(deletion.body.message).toMatch(/deleted/i);
    });
  });

  describe('GET /alerts/:id/history', () => {
    it('should return alert history entries', async () => {
      const newAlert = await Alert.create({
        userId: 1,
        symbol: 'BTC',
        conditionType: 'above',
        threshold: 30000,
        isActive: false
      });

      await AlertHistory.create({
        alertId: newAlert.id,
        triggeredAt: new Date(),
        notificationSent: true,
        message: 'Test triggered manually'
      });
  
      const res = await request(server)
        .get(`/alerts/${newAlert.id}/history`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].message).toBe('Test triggered manually');
    });
  });
  
});

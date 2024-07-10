import express from 'express';
import bodyParser from 'body-parser';
import sequelize from './database';
import Item from './models/Item';
import * as cron from 'node-cron';

const app = express();
app.use(bodyParser.json());

app.listen(3000, async () => {
    await sequelize.sync();
    console.log('Server is running on port 3000');
});

cron.schedule('0 * * * *', async () => {
        await Item.destroy({ where: { expiry: { [Op.lt]: Date.now() } } });
        console.log('Expired items cleared');
    });

// Creating endpoints
//Post /add
app.post('/:item/add', async (req, res) => {
    const { item } = req.params;
    const { quantity, expiry } = req.body;
  
    await Item.create({ name: item, quantity, expiry });
    res.status(201).send({});
  });
  
  //Post /sell
  app.post('/:item/sell', async (req, res) => {
    const { item } = req.params;
    const { quantity } = req.body;
  
    const items = await Item.findAll({
      where: { name: item, expiry: { [Op.gt]: Date.now() } },
      order: [['expiry', 'ASC']],
    });
  
    let remainingQuantity = quantity;
  
    for (const item of items) {
      if (remainingQuantity <= 0) break;
      if (item.quantity <= remainingQuantity) {
        remainingQuantity -= item.quantity;
        await item.destroy();
      } else {
        item.quantity -= remainingQuantity;
        await item.save();
        remainingQuantity = 0;
      }
    }
  
    if (remainingQuantity > 0) {
      return res.status(400).send({ error: 'Not enough quantity' });
    }
  
    res.status(200).send({});
  });

  //Get /quantity
  app.get('/:item/quantity', async (req, res) => {
    const { item } = req.params;
  
    const items = await Item.findAll({
      where: { name: item, expiry: { [Op.gt]: Date.now() } },
      order: [['expiry', 'ASC']],
    });
  
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const validTill = items.length > 0 ? items[0].expiry : null;
  
    res.status(200).send({ quantity, validTill });
  });
  
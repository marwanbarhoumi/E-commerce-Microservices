const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/product.controller');
const upload     = require('../middleware/upload.middleware');

router.get('/',                    controller.getAll);
router.get('/:id',                 controller.getOne);
router.post('/',                   controller.create);
router.put('/:id',                 controller.update);
router.delete('/:id',              controller.remove);
router.post('/upload-image',       upload.single('image'), controller.uploadImage); // ← jdid

module.exports = router;
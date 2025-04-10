const express = require('express');
const router = express.Router();
const { 
  createForm, 
  getAllForms, 
  getFormById, 
  updateForm, 
  deleteForm 
} = require('../Controller/formController');
const { upload } = require('../Middlewares/imageUploader');
const ensureAuthentication = require('../Middlewares/auth');


router.post('/create', upload.single('image'),ensureAuthentication ,createForm);

router.get('/all',ensureAuthentication , getAllForms);

router.get('/:id', ensureAuthentication ,getFormById);

router.put('/update/:id', upload.single('image'), ensureAuthentication ,updateForm);


router.delete('/delete/:id', ensureAuthentication ,deleteForm);

module.exports = router;
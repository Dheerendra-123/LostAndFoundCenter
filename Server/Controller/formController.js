const FormModel = require('../Models/Form');
const { uploadToCloudinary, removeLocalFile } = require('../Middlewares/imageUploader');


const createForm = async (req, res) => {
  try {
    // If no file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload an image' 
      });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.path);
    
    // Create a new form document
    const newForm = new FormModel({
      userId: req.body.userId,
      item: req.body.item,
      type:req.body.type,
      claimStatus: false, 
      category: req.body.category,
      date_lost: req.body.date_lost,
      date_found:req.body.date_found,
      description: req.body.description,
      location: req.body.location,
      contact_name: req.body.contact_name,
      contact_email: req.body.contact_email,
      contact_phone: req.body.contact_phone,
      reward_offer: req.body.reward_offer,
      department: req.body.department,
      image: {
        url: result.url,
        public_id: result.public_id
      }
    });

    const savedForm = await newForm.save();
    console.log("data of the user:",newForm);
    removeLocalFile(req.file.path);

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      data: savedForm
    });
  } catch (error) {
    if (req.file) {
      removeLocalFile(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all forms
// const getAllForms = async (req, res) => {
//   try {
//     const forms = await FormModel.find();
//     res.status(200).json({
//       message:'all Users data has been fetched',
//       success: true,
//       count: forms.length,
//       data: forms
//     });
//     console.log("All forms data",forms);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

const getAllForms = async (req, res) => {
  try {
    const forms = await FormModel.find()
      .populate('userId', 'name email')        // if needed
      .populate('claimedBy', 'name email');    // this is the key addition

    res.status(200).json({
      message: 'All Users data has been fetched',
      success: true,
      count: forms.length,
      data: forms
    });

    console.log("All forms data", forms);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get form by ID
const getFormById = async (req, res) => {
  try {
    const form = await FormModel.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    res.status(200).json({
        message:"The form data with user id is fetched",
      success: true,
      data: form
    });
    console.log(`form data with user is ${req.params.id} is fetched`,form);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update form
const updateForm = async (req, res) => {
  try {
    let form = await FormModel.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    const updateData = {
      item: req.body.item,
      type:req.body.type,
      category: req.body.category,
      date_lost: req.body.date_lost,
      date_found: req.body.date_found,
      description: req.body.description,
      location: req.body.location,
      contact_name: req.body.contact_name,
      contact_email: req.body.contact_email,
      contact_phone: req.body.contact_phone,
      reward_offer: req.body.reward_offer,
      department: req.body.department
    };
    
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path);
      
      updateData.image = {
        url: result.url,
        public_id: result.public_id
      };
      
      // Remove locally stored file
      removeLocalFile(req.file.path);
    }
    
    // Update the form
    form = await FormModel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      message: 'Form updated successfully',
      data: form
    });
    console.log(`form with user id ${req.params.id} is updated`,form);
  } catch (error) {

    if (req.file) {
      removeLocalFile(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete form
const deleteForm = async (req, res) => {
  try {
    const form = await FormModel.findById(req.params.id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    // Delete form from database
    await form.remove();
    
    res.status(200).json({
      success: true,
      message: 'Form deleted successfully'
    });
    console.log(`form with user id ${req.params.id} is deleted`,form);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createForm,
  getAllForms,
  getFormById,
  updateForm,
  deleteForm
};
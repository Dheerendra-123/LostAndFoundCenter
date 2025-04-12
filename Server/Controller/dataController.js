const FormModel = require("../Models/Form");

const claimForm = async (req, res) => {
    try {
      const form = await FormModel.findById(req.params.id);
  
      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found'
        });
      }
  
      // Save the user who claimed it
      form.claimStatus = true;
      form.claimedBy = req.user._id;
      console.log(form.claimedBy);
  
      await form.save();
  
      res.status(200).json({
        success: true,
        message: 'Item claimed successfully',
        data: form,
        claimedBy:form.claimedBy,
      });
  
      console.log("This item is Claimed", form);
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  

module.exports=claimForm;
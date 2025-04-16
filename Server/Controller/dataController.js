const FormModel = require("../Models/Form");
const UserModel = require("../Models/User"); 
const { sendClaimNotification } = require("../services/emailService");

const claimForm = async (req, res) => {
  try {
    // Find the form
    const form = await FormModel.findById(req.params.id);
      
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found'
      });
    }
    
    // Get the complete user information who is claiming the item
    const claimingUser = await UserModel.findById(req.user.userId);
    if (!claimingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Save the claim information
    form.claimStatus = true;
    form.claimedBy = req.user.userId;
    
    await form.save();
    
    // Send email notification from the authenticated user to the form's contact email
    try {
      await sendClaimNotification(
        {
          name: claimingUser.name,
          email: claimingUser.email
        },
        form
      );
      
      console.log("Claim notification email sent from:", claimingUser.email, "to:", form.contact_email);
    } catch (emailError) {
      console.error("Failed to send claim notification email:", emailError);
      // Continue with the process even if email fails
    }
    
    res.status(200).json({
      success: true,
      message: 'Item claimed successfully. An email has been sent to the reporter from your account.',
      data: form
    });
    
    console.log("This item is claimed by:", claimingUser.name);
  } catch (error) {
    console.error("Error claiming item:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = claimForm;
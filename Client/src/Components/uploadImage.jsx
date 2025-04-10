import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { IconButton, Box, Typography, Stack, FormHelperText, LinearProgress } from "@mui/material";

const ImageUpload=({ images, handleFileSelect, handleRemoveImage, mediaLoading })=> {
  return (
    <Box mb={4} sx={{ width: "98%", paddingTop: "10px" }}>
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ width: '100%' }}>
        <Box
          flex={1}
          component="label"
          sx={{
            border: "1px dashed gray",
            borderRadius: "8px",
            height: "200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            backgroundColor: "#f9f9f9",
            "&:hover": { backgroundColor: "#f0f0f0" }
          }}
        >
          <ImageIcon color="primary" sx={{ fontSize: "60px" }} />
          <Typography fontWeight="bold">Upload Images</Typography>
          <FormHelperText>Maximum 1 image</FormHelperText>
          <input
            type="file"
            multiple
            accept="image/*"
            hidden
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </Box>
      </Stack>

      {mediaLoading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
        </Box>
      )}

      <FormHelperText sx={{ mt: 2 }}>Media Preview</FormHelperText>
      <Box sx={{ mt: 1 }}>
        <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={2}>
          {images.map((file, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                height: 80,
                width: 80,
                border: "1px solid lightgray",
                borderRadius: "10px",
                overflow: "hidden"
              }}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                height={80}
                width={80}
                style={{ borderRadius: "10px", objectFit: "cover" }}
              />
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,1)" }
                }}
                onClick={() => handleRemoveImage(index)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

export default ImageUpload;

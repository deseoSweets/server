module.exports = ({ env }) => ({
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
        },
        actionOptions: {
          upload: {
            resource_type: (file) => {
              // Check if the file is a PDF
              if (file.mime === 'application/pdf') {
                return 'raw';
              }
              return 'image';
            },
          },
          uploadStream: {},
          delete: {},
        },
      },
    },
  });


const InvariantError = require('../../exceptions/InvariantError');
const {
  AddPlaylistPayloadSchema,
  AddPlaylistSongPayloadSchema,
  DeletePlaylistSongPayloadSchema,
} = require('./schema');

const SongsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = AddPlaylistPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAddPlaylistSongPayload: (payload) => {
    const validationResult = AddPlaylistSongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateDeletePlaylistSongPayload: (payload) => {
    const validationResult = DeletePlaylistSongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;

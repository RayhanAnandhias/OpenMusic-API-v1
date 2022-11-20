const Joi = require('joi');

const AddPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const AddPlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeletePlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  AddPlaylistPayloadSchema,
  AddPlaylistSongPayloadSchema,
  DeletePlaylistSongPayloadSchema,
};

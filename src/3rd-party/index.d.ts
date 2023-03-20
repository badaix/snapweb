export as namespace Flac;
/**
 * @property {"FLAC__STREAM_DECODER_INIT_STATUS_OK"} 0  Initialization was successful.
 * @property {"FLAC__STREAM_DECODER_INIT_STATUS_UNSUPPORTED_CONTAINER"} 1  The library was not compiled with support for the given container format.
 * @property {"FLAC__STREAM_DECODER_INIT_STATUS_INVALID_CALLBACKS"} 2  A required callback was not supplied.
 * @property {"FLAC__STREAM_DECODER_INIT_STATUS_MEMORY_ALLOCATION_ERROR"} 3  An error occurred allocating memory.
 * @property {"FLAC__STREAM_DECODER_INIT_STATUS_ERROR_OPENING_FILE"} 4  fopen() failed in FLAC__stream_decoder_init_file() or FLAC__stream_decoder_init_ogg_file().
 * @property {"FLAC__STREAM_DECODER_INIT_STATUS_ALREADY_INITIALIZED"} 5  FLAC__stream_decoder_init_*() was called when the decoder was already initialized, usually because FLAC__stream_decoder_finish() was not called.
 */
export type FLAC__StreamDecoderInitStatus = 0 | 1 | 2 | 3 | 4 | 5;
/**
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_OK"} 0  Initialization was successful.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_ENCODER_ERROR"} 1  General failure to set up encoder; call FLAC__stream_encoder_get_state() for cause.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_UNSUPPORTED_CONTAINER"} 2  The library was not compiled with support for the given container format.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_INVALID_CALLBACKS"} 3  A required callback was not supplied.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_INVALID_NUMBER_OF_CHANNELS"} 4  The encoder has an invalid setting for number of channels.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_INVALID_BITS_PER_SAMPLE"} 5  The encoder has an invalid setting for bits-per-sample. FLAC supports 4-32 bps but the reference encoder currently supports only up to 24 bps.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_INVALID_SAMPLE_RATE"} 6  The encoder has an invalid setting for the input sample rate.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_INVALID_BLOCK_SIZE"} 7  The encoder has an invalid setting for the block size.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_INVALID_MAX_LPC_ORDER"} 8  The encoder has an invalid setting for the maximum LPC order.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_INVALID_QLP_COEFF_PRECISION"} 9  The encoder has an invalid setting for the precision of the quantized linear predictor coefficients.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_BLOCK_SIZE_TOO_SMALL_FOR_LPC_ORDER"} 10  The specified block size is less than the maximum LPC order.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_NOT_STREAMABLE"} 11  The encoder is bound to the Subset but other settings violate it.
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_INVALID_METADATA"} 12  The metadata input to the encoder is invalid, in one of the following ways:
 * 																						      FLAC__stream_encoder_set_metadata() was called with a null pointer but a block count > 0
 * 																						      One of the metadata blocks contains an undefined type
 * 																						      It contains an illegal CUESHEET as checked by FLAC__format_cuesheet_is_legal()
 * 																						      It contains an illegal SEEKTABLE as checked by FLAC__format_seektable_is_legal()
 * 																						      It contains more than one SEEKTABLE block or more than one VORBIS_COMMENT block
 * @property {"FLAC__STREAM_ENCODER_INIT_STATUS_ALREADY_INITIALIZED"} 13  FLAC__stream_encoder_init_*() was called when the encoder was already initialized, usually because FLAC__stream_encoder_finish() was not called.
 */
export type FLAC__StreamEncoderInitStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
/**
 * Decoding error codes.
 * 
 * <br>
 * If the error code is not known, value <code>FLAC__STREAM_DECODER_ERROR__UNKNOWN__</code> is used.
 * 
 * @property {"FLAC__STREAM_DECODER_ERROR_STATUS_LOST_SYNC"} 0  An error in the stream caused the decoder to lose synchronization.
 * @property {"FLAC__STREAM_DECODER_ERROR_STATUS_BAD_HEADER"} 1  The decoder encountered a corrupted frame header.
 * @property {"FLAC__STREAM_DECODER_ERROR_STATUS_FRAME_CRC_MISMATCH"} 2  The frame's data did not match the CRC in the footer.
 * @property {"FLAC__STREAM_DECODER_ERROR_STATUS_UNPARSEABLE_STREAM"} 3  The decoder encountered reserved fields in use in the stream.
 */
export type FLAC__StreamDecoderErrorStatus = 0 | 1 | 2 | 3;
/**
 * Additional options for encoding or decoding
 * 
 * @property {boolean} [analyseSubframes]  for decoding: include subframes metadata in write-callback metadata, DEFAULT: false
 * @property {boolean} [analyseResiduals]  for decoding: include residual data in subframes metadata in write-callback metadata, NOTE {@link #analyseSubframes} muste also be enabled, DEFAULT: false
 * @property {boolean} [enableRawMetadata]  DEBUG option for decoding: enable receiving raw metadata for unknown metadata types in second argument in the metadata-callback, DEFAULT: false
 * @see Flac#setOptions
 * @see Flac~metadata_callback_fn
 * @see Flac#FLAC__stream_decoder_set_metadata_respond_all
 */
export interface CodingOptions {
  /**
   * for decoding: include subframes metadata in write-callback metadata, DEFAULT: false
   */
  analyseSubframes?: boolean;
  /**
   * for decoding: include residual data in subframes metadata in write-callback metadata, NOTE {@link #analyseSubframes} muste also be enabled, DEFAULT: false
   */
  analyseResiduals?: boolean;
  /**
   * DEBUG option for decoding: enable receiving raw metadata for unknown metadata types in second argument in the metadata-callback, DEFAULT: false
   */
  enableRawMetadata?: boolean;
}
/**
 * FLAC raw metadata
 * 
 * @property {FLAC__MetadataType} type  the type of the metadata
 * @property {boolean} isLast  if it is the last block of metadata
 * @property {number} length  the length of the metadata block (bytes)
 * @property {StreamMetadata | PaddingMetadata | ApplicationMetadata | SeekTableMetadata | CueSheetMetadata | PictureMetadata} [data]  the metadata (omitted for unknown metadata types)
 * @property {Uint8Array} [raw]  raw metadata (for debugging: enable via {@link Flac#setOptions})
 */
export interface MetadataBlock {
  /**
   * the type of the metadata
   */
  type: FLAC__MetadataType;
  /**
   * if it is the last block of metadata
   */
  isLast: boolean;
  /**
   * the length of the metadata block (bytes)
   */
  length: number;
  /**
   * the metadata (omitted for unknown metadata types)
   */
  data?: StreamMetadata | PaddingMetadata | ApplicationMetadata | SeekTableMetadata | CueSheetMetadata | PictureMetadata;
  /**
   * raw metadata (for debugging: enable via {@link Flac#setOptions})
   */
  raw?: Uint8Array;
}
/**
 * FLAC padding metadata block
 * 
 * @property {number} dummy  Conceptually this is an empty struct since we don't store the padding bytes. Empty structs are not allowed by some C compilers, hence the dummy.
 * @see Flac.FLAC__MetadataType#FLAC__METADATA_TYPE_PADDING
 */
export interface PaddingMetadata {
  /**
   * Conceptually this is an empty struct since we don't store the padding bytes. Empty structs are not allowed by some C compilers, hence the dummy.
   */
  dummy: number;
}
/**
 * FLAC application metadata block
 * 
 * NOTE the application meta data type is not really supported, i.e. the
 *      (binary) data is only a pointer to the memory heap.
 * 
 * @property {number} id  the application ID
 * @property {number} data  (pointer)
 * @see Flac.FLAC__MetadataType#FLAC__METADATA_TYPE_APPLICATION
 * @see {@link https://xiph.org/flac/format.html#metadata_block_application|application block format specification}
 */
export interface ApplicationMetadata {
  /**
   * the application ID
   */
  id: number;
  /**
   * (pointer)
   */
  data: number;
}
/**
 * FLAC seek table metadata block
 * 
 * <p>
 * From the format specification:
 * 
 * The seek points must be sorted by ascending sample number.
 * 
 * Each seek point's sample number must be the first sample of the target frame.
 * 
 * Each seek point's sample number must be unique within the table
 * 
 * Existence of a SEEKTABLE block implies a correct setting of total_samples in the stream_info block.
 * 
 * Behavior is undefined when more than one SEEKTABLE block is present in a stream.
 * 
 * @property {number} num_points  the number of seek points
 * @property {Array<SeekPoint>} points  the seek points
 * @see Flac.FLAC__MetadataType#FLAC__METADATA_TYPE_SEEKTABLE
 */
export interface SeekTableMetadata {
  /**
   * the number of seek points
   */
  num_points: number;
  /**
   * the seek points
   */
  points: Array<SeekPoint>;
}
/**
 * FLAC seek point data
 * 
 * @property {number} sample_number  The sample number of the target frame. NOTE <code>-1</code> for a placeholder point.
 * @property {number} stream_offset  The offset, in bytes, of the target frame with respect to beginning of the first frame.
 * @property {number} frame_samples  The number of samples in the target frame.
 * @see Flac.SeekTableMetadata
 */
export interface SeekPoint {
  /**
   * The sample number of the target frame. NOTE <code>-1</code> for a placeholder point.
   */
  sample_number: number;
  /**
   * The offset, in bytes, of the target frame with respect to beginning of the first frame.
   */
  stream_offset: number;
  /**
   * The number of samples in the target frame.
   */
  frame_samples: number;
}
/**
 * FLAC vorbis comment metadata block
 * 
 * @property {string} vendor_string  the vendor string
 * @property {number} num_comments  the number of comments
 * @property {Array<string>} comments  the comments
 * @see Flac.FLAC__MetadataType#FLAC__METADATA_TYPE_VORBIS_COMMENT
 */
export interface VorbisCommentMetadata {
  /**
   * the vendor string
   */
  vendor_string: string;
  /**
   * the number of comments
   */
  num_comments: number;
  /**
   * the comments
   */
  comments: Array<string>;
}
/**
 * FLAC cue sheet metadata block
 * 
 * @property {string} media_catalog_number  Media catalog number, in ASCII printable characters 0x20-0x7e. In general, the media catalog number may be 0 to 128 bytes long.
 * @property {number} lead_in  The number of lead-in samples.
 * @property {boolean} is_cd  true if CUESHEET corresponds to a Compact Disc, else false.
 * @property {number} num_tracks  The number of tracks.
 * @property {Array<CueSheetTrack>} tracks  the tracks
 * @see Flac.FLAC__MetadataType#FLAC__METADATA_TYPE_CUESHEET
 */
export interface CueSheetMetadata {
  /**
   * Media catalog number, in ASCII printable characters 0x20-0x7e. In general, the media catalog number may be 0 to 128 bytes long.
   */
  media_catalog_number: string;
  /**
   * The number of lead-in samples.
   */
  lead_in: number;
  /**
   * true if CUESHEET corresponds to a Compact Disc, else false.
   */
  is_cd: boolean;
  /**
   * The number of tracks.
   */
  num_tracks: number;
  /**
   * the tracks
   */
  tracks: Array<CueSheetTrack>;
}
/**
 * FLAC cue sheet track data
 * 
 * @property {number} offset  Track offset in samples, relative to the beginning of the FLAC audio stream.
 * @property {number} number  The track number.
 * @property {string} isrc  Track ISRC. This is a 12-digit alphanumeric code.
 * @property {"AUDIO" | "NON_AUDIO"} type  The track type: audio or non-audio.
 * @property {boolean} pre_emphasis  The pre-emphasis flag
 * @property {number} num_indices  The number of track index points.
 * @property {CueSheetTracIndex} indices  The track index points.
 * @see Flac.CueSheetMetadata
 */
export interface CueSheetTrack {
  /**
   * Track offset in samples, relative to the beginning of the FLAC audio stream.
   */
  offset: number;
  /**
   * The track number.
   */
  number: number;
  /**
   * Track ISRC. This is a 12-digit alphanumeric code.
   */
  isrc: string;
  /**
   * The track type: audio or non-audio.
   */
  type: "AUDIO" | "NON_AUDIO";
  /**
   * The pre-emphasis flag
   */
  pre_emphasis: boolean;
  /**
   * The number of track index points.
   */
  num_indices: number;
  /**
   * The track index points.
   */
  indices: CueSheetTracIndex;
}
/**
 * FLAC track index data for cue sheet metadata
 * 
 * @property {number} offset  Offset in samples, relative to the track offset, of the index point.
 * @property {number} number  The index point number.
 * @see Flac.CueSheetTrack
 */
export interface CueSheetTracIndex {
  /**
   * Offset in samples, relative to the track offset, of the index point.
   */
  offset: number;
  /**
   * The index point number.
   */
  number: number;
}
/**
 * FLAC picture metadata block
 * 
 * @property {FLAC__StreamMetadata_Picture_Type} type  The kind of picture stored.
 * @property {string} mime_type  Picture data's MIME type, in ASCII printable characters 0x20-0x7e, NUL terminated. For best compatibility with players, use picture data of MIME type image/jpeg or image/png. A MIME type of '–>' is also allowed, in which case the picture data should be a complete URL.
 * @property {string} description  Picture's description.
 * @property {number} width  Picture's width in pixels.
 * @property {number} height  Picture's height in pixels.
 * @property {number} depth  Picture's color depth in bits-per-pixel.
 * @property {number} colors  For indexed palettes (like GIF), picture's number of colors (the number of palette entries), or 0 for non-indexed (i.e. 2^depth).
 * @property {number} data_length  Length of binary picture data in bytes.
 * @property {Uint8Array} data  Binary picture data.
 */
export interface PictureMetadata {
  /**
   * The kind of picture stored.
   */
  type: FLAC__StreamMetadata_Picture_Type;
  /**
   * Picture data's MIME type, in ASCII printable characters 0x20-0x7e, NUL terminated. For best compatibility with players, use picture data of MIME type image/jpeg or image/png. A MIME type of '–>' is also allowed, in which case the picture data should be a complete URL.
   */
  mime_type: string;
  /**
   * Picture's description.
   */
  description: string;
  /**
   * Picture's width in pixels.
   */
  width: number;
  /**
   * Picture's height in pixels.
   */
  height: number;
  /**
   * Picture's color depth in bits-per-pixel.
   */
  depth: number;
  /**
   * For indexed palettes (like GIF), picture's number of colors (the number of palette entries), or 0 for non-indexed (i.e. 2^depth).
   */
  colors: number;
  /**
   * Length of binary picture data in bytes.
   */
  data_length: number;
  /**
   * Binary picture data.
   */
  data: Uint8Array;
}
/**
 * An enumeration of the PICTURE types (see FLAC__StreamMetadataPicture and id3 v2.4 APIC tag).
 * 
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_OTHER"} 0  Other
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_FILE_ICON_STANDARD"} 1  32x32 pixels 'file icon' (PNG only)
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_FILE_ICON"} 2  Other file icon
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_FRONT_COVER"} 3  Cover (front)
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_BACK_COVER"} 4  Cover (back)
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_LEAFLET_PAGE"} 5  Leaflet page
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_MEDIA"} 6  Media (e.g. label side of CD)
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_LEAD_ARTIST"} 7  Lead artist/lead performer/soloist
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_ARTIST"} 8  Artist/performer
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_CONDUCTOR"} 9  Conductor
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_BAND"} 10  Band/Orchestra
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_COMPOSER"} 11  Composer
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_LYRICIST"} 12  Lyricist/text writer
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_RECORDING_LOCATION"} 13  Recording Location
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_DURING_RECORDING"} 14  During recording
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_DURING_PERFORMANCE"} 15  During performance
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_VIDEO_SCREEN_CAPTURE"} 16  Movie/video screen capture
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_FISH"} 17  A bright coloured fish
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_ILLUSTRATION"} 18  Illustration
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_BAND_LOGOTYPE"} 19  Band/artist logotype
 * @property {"FLAC__STREAM_METADATA_PICTURE_TYPE_PUBLISHER_LOGOTYPE"} 20  Publisher/Studio logotype
 * @see Flac.PictureMetadata
 */
export type FLAC__StreamMetadata_Picture_Type = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;
/**
 * An enumeration of the available metadata block types.
 * 
 * @property {"FLAC__METADATA_TYPE_STREAMINFO"} 0  STREAMINFO block
 * @property {"FLAC__METADATA_TYPE_PADDING"} 1  PADDING block
 * @property {"FLAC__METADATA_TYPE_APPLICATION"} 2  APPLICATION block
 * @property {"FLAC__METADATA_TYPE_SEEKTABLE"} 3  SEEKTABLE block
 * @property {"FLAC__METADATA_TYPE_VORBIS_COMMENT"} 4  VORBISCOMMENT block (a.k.a. FLAC tags)
 * @property {"FLAC__METADATA_TYPE_CUESHEET"} 5  CUESHEET block
 * @property {"FLAC__METADATA_TYPE_PICTURE"} 6  PICTURE block
 * @property {"FLAC__METADATA_TYPE_UNDEFINED"} 7  marker to denote beginning of undefined type range; this number will increase as new metadata types are added
 * @property {"FLAC__MAX_METADATA_TYPE"} 126  No type will ever be greater than this. There is not enough room in the protocol block.
 * @see Flac.MetadataBlock
 * @see {@link https://xiph.org/flac/format.html|FLAC format documentation}
 */
export type FLAC__MetadataType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 126;
/**
 * Set coding options for an encoder / decoder instance (will / should be deleted, when finish()/delete())
 * 
 * @public
 * @param {Number} p_coder  the encoder/decoder pointer (ID)
 * @param {CodingOptions} options  the coding options
 */
export function setOptions(p_coder: Number, options: CodingOptions): void;
/**
 * Get coding options for the encoder / decoder instance:
 * returns FALSY when not set.
 * 
 * @public
 * @param {Number} p_coder  the encoder/decoder pointer (ID)
 * @returns {CodingOptions}  the coding options
 */
export function getOptions(p_coder: Number): CodingOptions;
/**
 * Returns if Flac has been initialized / is ready to be used.
 * 
 * @returns {boolean}  <code>true</code>, if Flac is ready to be used
 * @see {@link Flac#onready|onready}
 * @see {@link Flac#on|on}
 */
export function isReady(): boolean;
/**
 * Hook for handler function that gets called, when asynchronous initialization has finished.
 * 
 * NOTE that if the execution environment does not support <code>Object#defineProperty</code>, then
 *      this function is not called, after {@link Flac#isReady|isReady} is <code>true</code>.
 *      In this case, {@link Flac#isReady|isReady} should be checked, before setting <code>onready</code>
 *      and if it is <code>true</code>, handler should be executed immediately instead of setting <code>onready</code>.
 * 
 * @param {ReadyEvent} event  the ready-event object
 * @see {@link Flac#isReady|isReady}
 * @see {@link Flac#on|on}
 * @example 
 * // [1] if Object.defineProperty() IS supported:
 *  Flac.onready = function(event){
 *     //gets executed when library becomes ready, or immediately, if it already is ready...
 * 	   doSomethingWithFlac();
 *  };
 * 
 *  // [2] if Object.defineProperty() is NOT supported:
 * 	// do check Flac.isReady(), and only set handler, if not ready yet
 *  // (otherwise immediately excute handler code)
 *  if(!Flac.isReady()){
 *    Flac.onready = function(event){
 *       //gets executed when library becomes ready...
 * 		 doSomethingWithFlac();
 *    };
 *  } else {
 * 		// Flac is already ready: immediately start processing
 * 		doSomethingWithFlac();
 * 	}
 */
export var onready: ((event: ReadyEvent) => void)|undefined;
/**
 * Ready event: is fired when the library has been initialized and is ready to be used
 * (e.g. asynchronous loading of binary / WASM modules has been completed).
 * 
 * Before this event is fired, use of functions related to encoding and decoding may
 * cause errors.
 * 
 * @property {"ready"} type  the type of the event <code>"ready"</code>
 * @property {any} target  the initalized FLAC library instance
 * @see {@link Flac#isReady|isReady}
 * @see {@link Flac#on|on}
 */
export interface ReadyEvent {
  /**
   * the type of the event <code>"ready"</code>
   */
  type: "ready";
  /**
   * the initalized FLAC library instance
   */
  target: any;
}
/**
 * Created event: is fired when an encoder or decoder was created.
 * 
 * @property {"created"} type  the type of the event <code>"created"</code>
 * @property {CoderChangedEventData} target  the information for the created encoder or decoder
 * @see {@link Flac#on|on}
 */
export interface CreatedEvent {
  /**
   * the type of the event <code>"created"</code>
   */
  type: "created";
  /**
   * the information for the created encoder or decoder
   */
  target: CoderChangedEventData;
}
/**
 * Destroyed event: is fired when an encoder or decoder was destroyed.
 * 
 * @property {"destroyed"} type  the type of the event <code>"destroyed"</code>
 * @property {CoderChangedEventData} target  the information for the destroyed encoder or decoder
 * @see {@link Flac#on|on}
 */
export interface DestroyedEvent {
  /**
   * the type of the event <code>"destroyed"</code>
   */
  type: "destroyed";
  /**
   * the information for the destroyed encoder or decoder
   */
  target: CoderChangedEventData;
}
/**
 * Life cycle event data for signaling life cycle changes of encoder or decoder instances
 * 
 * @property {number} id  the ID for the encoder or decoder instance
 * @property {"encoder" | "decoder"} type  signifies whether the event is for an encoder or decoder instance
 * @property {any} [data]  specific data for the life cycle change
 * @see Flac.event:CreatedEvent
 * @see Flac.event:DestroyedEvent
 */
export interface CoderChangedEventData {
  /**
   * the ID for the encoder or decoder instance
   */
  id: number;
  /**
   * signifies whether the event is for an encoder or decoder instance
   */
  type: "encoder" | "decoder";
  /**
   * specific data for the life cycle change
   */
  data?: any;
}
/**
 * Add an event listener for module-events.
 * Supported events:
 * <ul>
 *  <li> <code>"ready"</code> &rarr; {@link Flac.event:ReadyEvent}: emitted when module is ready for usage (i.e. {@link Flac#isReady|isReady} is true)<br/>
 *             <em>NOTE listener will get immediately triggered if module is already <code>"ready"</code></em>
 *  </li>
 *  <li> <code>"created"</code> &rarr; {@link Flac.event:CreatedEvent}: emitted when an encoder or decoder instance was created<br/>
 *  </li>
 *  <li> <code>"destroyed"</code> &rarr; {@link Flac.event:DestroyedEvent}: emitted when an encoder or decoder instance was destroyed<br/>
 *  </li>
 * </ul>
 * 
 * @param {string} eventName  
 * @param {Function} listener  
 * @see {@link Flac#off|off}
 * @see {@link Flac#onready|onready}
 * @see Flac.event:ReadyEvent
 * @see Flac.event:CreatedEvent
 * @see Flac.event:DestroyedEvent
 * @example 
 * Flac.on('ready', function(event){
 *     //gets executed when library is ready, or becomes ready...
 *  });
 */
export function on(eventName: string, listener: Function): void;
/**
 * Remove an event listener for module-events.
 * 
 * @param {string} eventName  
 * @param {Function} listener  
 * @see {@link Flac#on|on}
 */
export function off(eventName: string, listener: Function): void;
/**
 * Set the "verify" flag. If true, the encoder will verify it's own encoded output by feeding it through an internal decoder and comparing the original signal against the decoded signal. If a mismatch occurs, the process call will return false. Note that this will slow the encoding process by the extra time required for decoding and comparison.
 * 
 * <p>
 * NOTE: only use on un-initilized encoder instances!
 * 
 * @param {number} encoder  the ID of the encoder instance
 * @param {boolean} is_verify  enable/disable checksum verification during encoding
 * @returns {boolean}  <code>false</code> if the encoder is already initialized, else <code>true</code>
 * @see {@link Flac#create_libflac_encoder|create_libflac_encoder}
 * @see {@link Flac#FLAC__stream_encoder_get_verify|FLAC__stream_encoder_get_verify}
 */
export function FLAC__stream_encoder_set_verify(encoder: number, is_verify: boolean): boolean;
/**
 * Set the compression level
 * 
 * The compression level is roughly proportional to the amount of effort the encoder expends to compress the file. A higher level usually means more computation but higher compression. The default level is suitable for most applications.
 * 
 * Currently the levels range from 0 (fastest, least compression) to 8 (slowest, most compression). A value larger than 8 will be treated as 8.
 * 
 * 
 * <p>
 * NOTE: only use on un-initilized encoder instances!
 * 
 * @param {number} encoder  the ID of the encoder instance
 * @param {CompressionLevel} compression_level  the desired Flac compression level: [0, 8]
 * @returns {boolean}  <code>false</code> if the encoder is already initialized, else <code>true</code>
 * @see {@link Flac#create_libflac_encoder|create_libflac_encoder}
 * @see Flac.CompressionLevel
 * @see {@link https://xiph.org/flac/api/group__flac__stream__encoder.html#gae49cf32f5256cb47eecd33779493ac85|FLAC API for FLAC__stream_encoder_set_compression_level()}
 */
export function FLAC__stream_encoder_set_compression_level(encoder: number, compression_level: CompressionLevel): boolean;
/**
 * Set the blocksize to use while encoding.
 * The number of samples to use per frame. Use 0 to let the encoder estimate a blocksize; this is usually best.
 * 
 * <p>
 * NOTE: only use on un-initilized encoder instances!
 * 
 * @param {number} encoder  the ID of the encoder instance
 * @param {number} block_size  the number of samples to use per frame
 * @returns {boolean}  <code>false</code> if the encoder is already initialized, else <code>true</code>
 * @see {@link Flac#create_libflac_encoder|create_libflac_encoder}
 */
export function FLAC__stream_encoder_set_blocksize(encoder: number, block_size: number): boolean;
/**
 * Get the state of the verify stream decoder. Useful when the stream encoder state is FLAC__STREAM_ENCODER_VERIFY_DECODER_ERROR.
 * 
 * @param {number} encoder  the ID of the encoder instance
 * @returns {FLAC__StreamDecoderState}  the verify stream decoder state
 */
export function FLAC__stream_encoder_get_verify_decoder_state(encoder: number): FLAC__StreamDecoderState;
/**
 * Get the "verify" flag for the encoder.
 * 
 * @param {number} encoder  the ID of the encoder instance
 * @returns {boolean}  the verify flag for the encoder
 * @see {@link Flac#FLAC__stream_encoder_set_verify|FLAC__stream_encoder_set_verify}
 */
export function FLAC__stream_encoder_get_verify(encoder: number): boolean;
/**
 * Set the compression level
 * 
 * The compression level is roughly proportional to the amount of effort the encoder expends to compress the file. A higher level usually means more computation but higher compression. The default level is suitable for most applications.
 * 
 * Currently the levels range from 0 (fastest, least compression) to 8 (slowest, most compression). A value larger than 8 will be treated as 8.
 * 
 * This function automatically calls the following other set functions with appropriate values, so the client does not need to unless it specifically wants to override them:
 * <pre>
 *     FLAC__stream_encoder_set_do_mid_side_stereo()
 *     FLAC__stream_encoder_set_loose_mid_side_stereo()
 *     FLAC__stream_encoder_set_apodization()
 *     FLAC__stream_encoder_set_max_lpc_order()
 *     FLAC__stream_encoder_set_qlp_coeff_precision()
 *     FLAC__stream_encoder_set_do_qlp_coeff_prec_search()
 *     FLAC__stream_encoder_set_do_escape_coding()
 *     FLAC__stream_encoder_set_do_exhaustive_model_search()
 *     FLAC__stream_encoder_set_min_residual_partition_order()
 *     FLAC__stream_encoder_set_max_residual_partition_order()
 *     FLAC__stream_encoder_set_rice_parameter_search_dist()
 * </pre>
 * The actual values set for each level are:
 * | level  | do mid-side stereo  | loose mid-side stereo  | apodization                                    | max lpc order  | qlp coeff precision  | qlp coeff prec search  | escape coding  | exhaustive model search  | min residual partition order  | max residual partition order  | rice parameter search dist   |
 * |--------|---------------------|------------------------|------------------------------------------------|----------------|----------------------|------------------------|----------------|--------------------------|-------------------------------|-------------------------------|------------------------------|
 * | 0      | false               | false                  | tukey(0.5)                                     | 0              | 0                    | false                  | false          | false                    | 0                             | 3                             | 0                            |
 * | 1      | true                | true                   | tukey(0.5)                                     | 0              | 0                    | false                  | false          | false                    | 0                             | 3                             | 0                            |
 * | 2      | true                | false                  | tukey(0.5)                                     | 0              | 0                    | false                  | false          | false                    | 0                             | 3                             | 0                            |
 * | 3      | false               | false                  | tukey(0.5)                                     | 6              | 0                    | false                  | false          | false                    | 0                             | 4                             | 0                            |
 * | 4      | true                | true                   | tukey(0.5)                                     | 8              | 0                    | false                  | false          | false                    | 0                             | 4                             | 0                            |
 * | 5      | true                | false                  | tukey(0.5)                                     | 8              | 0                    | false                  | false          | false                    | 0                             | 5                             | 0                            |
 * | 6      | true                | false                  | tukey(0.5);partial_tukey(2)                    | 8              | 0                    | false                  | false          | false                    | 0                             | 6                             | 0                            |
 * | 7      | true                | false                  | tukey(0.5);partial_tukey(2)                    | 12             | 0                    | false                  | false          | false                    | 0                             | 6                             | 0                            |
 * | 8      | true                | false                  | tukey(0.5);partial_tukey(2);punchout_tukey(3)  | 12             | 0                    | false                  | false          | false                    | 0                             | 6                             | 0                            |
 * 
 * @property {"FLAC__COMPRESSION_LEVEL_0"} 0  compression level 0
 * @property {"FLAC__COMPRESSION_LEVEL_1"} 1  compression level 1
 * @property {"FLAC__COMPRESSION_LEVEL_2"} 2  compression level 2
 * @property {"FLAC__COMPRESSION_LEVEL_3"} 3  compression level 3
 * @property {"FLAC__COMPRESSION_LEVEL_4"} 4  compression level 4
 * @property {"FLAC__COMPRESSION_LEVEL_5"} 5  compression level 5
 * @property {"FLAC__COMPRESSION_LEVEL_6"} 6  compression level 6
 * @property {"FLAC__COMPRESSION_LEVEL_7"} 7  compression level 7
 * @property {"FLAC__COMPRESSION_LEVEL_8"} 8  compression level 8
 */
export type CompressionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
/**
 * Create an encoder.
 * 
 * @param {number} sample_rate  the sample rate of the input PCM data
 * @param {number} channels  the number of channels of the input PCM data
 * @param {number} bps  bits per sample of the input PCM data
 * @param {CompressionLevel} compression_level  the desired Flac compression level: [0, 8]
 * @param {number} [total_samples]  OPTIONAL
 * 					the number of total samples of the input PCM data:<br>
 * 					 Sets an estimate of the total samples that will be encoded.
 * 					 This is merely an estimate and may be set to 0 if unknown.
 * 					 This value will be written to the STREAMINFO block before encoding,
 * 					 and can remove the need for the caller to rewrite the value later if
 * 					 the value is known before encoding.<br>
 * 					If specified, the it will be written into metadata of the FLAC header.<br>
 * 					DEFAULT: 0 (i.e. unknown number of samples)
 * @param {boolean} [is_verify]  OPTIONAL
 * 					enable/disable checksum verification during encoding<br>
 * 					DEFAULT: true<br>
 * 					NOTE: this argument is positional (i.e. total_samples must also be given)
 * @param {number} [block_size]  OPTIONAL
 * 					the number of samples to use per frame.<br>
 * 					DEFAULT: 0 (i.e. encoder sets block size automatically)
 * 					NOTE: this argument is positional (i.e. total_samples and is_verify must also be given)
 * @returns {number}  the ID of the created encoder instance (or 0, if there was an error)
 */
export function create_libflac_encoder(sample_rate: number, channels: number, bps: number, compression_level: CompressionLevel, total_samples?: number, is_verify?: boolean, block_size?: number): number;
/**
 * @use {@link Flac#create_libflac_encoder|create_libflac_encoder} instead
 */
export function init_libflac_encoder(): void;
/**
 * Create a decoder.
 * 
 * @param {boolean} [is_verify]  enable/disable checksum verification during decoding<br>
 * 				DEFAULT: true
 * @returns {number}  the ID of the created decoder instance (or 0, if there was an error)
 */
export function create_libflac_decoder(is_verify?: boolean): number;
/**
 * @use {@link Flac#create_libflac_decoder|create_libflac_decoder} instead
 */
export function init_libflac_decoder(): void;
/**
 * The callback for writing the encoded FLAC data.
 * 
 * @param {Uint8Array} data  the encoded FLAC data
 * @param {number} numberOfBytes  the number of bytes in data
 * @param {number} samples  the number of samples encoded in data
 * @param {number} currentFrame  the number of the (current) encoded frame in data
 * @returns {void | false}  returning <code>false</code> indicates that an
 * 								unrecoverable error occurred and decoding should be aborted
 */
export type encoder_write_callback_fn = (data: Uint8Array, numberOfBytes: number, samples: number, currentFrame: number) => void | false;
/**
 * The callback for the metadata of the encoded/decoded Flac data.
 * 
 * By default, only the STREAMINFO metadata is enabled.
 * 
 * For other metadata types {@link Flac.FLAC__MetadataType} they need to be enabled,
 * see e.g. {@link Flac#FLAC__stream_decoder_set_metadata_respond}
 * 
 * @param {StreamMetadata | undefined} metadata  the FLAC meta data, NOTE only STREAMINFO is returned in first argument, for other types use 2nd argument's <code>metadataBlock.data<code>
 * @param {MetadataBlock} metadataBlock  the detailed meta data block
 * @see Flac#init_decoder_stream
 * @see Flac#init_encoder_stream
 * @see Flac.CodingOptions
 * @see Flac#FLAC__stream_decoder_set_metadata_respond_all
 */
export type metadata_callback_fn = (metadata: StreamMetadata | undefined, metadataBlock: MetadataBlock) => void;
/**
 * FLAC meta data
 * 
 * @property {number} sampleRate  the sample rate (Hz)
 * @property {number} channels  the number of channels
 * @property {number} bitsPerSample  bits per sample
 */
export interface Metadata {
  /**
   * the sample rate (Hz)
   */
  sampleRate: number;
  /**
   * the number of channels
   */
  channels: number;
  /**
   * bits per sample
   */
  bitsPerSample: number;
}
/**
 * FLAC stream meta data
 * 
 * @augments Flac.Metadata
 * @property {number} min_blocksize  the minimal block size (bytes)
 * @property {number} max_blocksize  the maximal block size (bytes)
 * @property {number} min_framesize  the minimal frame size (bytes)
 * @property {number} max_framesize  the maximal frame size (bytes)
 * @property {number} total_samples  the total number of (encoded/decoded) samples
 * @property {string} md5sum  the MD5 checksum for the decoded data (if validation is active)
 * @property {number} sampleRate  the sample rate (Hz)
 * @property {number} channels  the number of channels
 * @property {number} bitsPerSample  bits per sample
 */
export interface StreamMetadata {
  /**
   * the minimal block size (bytes)
   */
  min_blocksize: number;
  /**
   * the maximal block size (bytes)
   */
  max_blocksize: number;
  /**
   * the minimal frame size (bytes)
   */
  min_framesize: number;
  /**
   * the maximal frame size (bytes)
   */
  max_framesize: number;
  /**
   * the total number of (encoded/decoded) samples
   */
  total_samples: number;
  /**
   * the MD5 checksum for the decoded data (if validation is active)
   */
  md5sum: string;
  /**
   * the sample rate (Hz)
   */
  sampleRate: number;
  /**
   * the number of channels
   */
  channels: number;
  /**
   * bits per sample
   */
  bitsPerSample: number;
}
/**
 * Initialize the encoder.
 * 
 * @param {number} encoder  the ID of the encoder instance that has not been initialized (or has been reset)
 * @param {encoder_write_callback_fn} write_callback_fn  the callback for writing the encoded Flac data:
 * 				<pre>write_callback_fn(data: Uint8Array, numberOfBytes: Number, samples: Number, currentFrame: Number)</pre>
 * @param {metadata_callback_fn} [metadata_callback_fn]  OPTIONAL
 * 				the callback for the metadata of the encoded Flac data:
 * 				<pre>metadata_callback_fn(metadata: StreamMetadata)</pre>
 * @param {number | boolean} [ogg_serial_number]  OPTIONAL
 * 				if number or <code>true</code> is specified, the encoder will be initialized to
 * 				write to an OGG container, see {@link Flac.init_encoder_ogg_stream}:
 * 				<code>true</code> will set a default serial number (<code>1</code>),
 * 				if specified as number, it will be used as the stream's serial number within the ogg container.
 * @returns {FLAC__StreamEncoderInitStatus}  the encoder status (<code>0</code> for <code>FLAC__STREAM_ENCODER_INIT_STATUS_OK</code>)
 */
export function init_encoder_stream(encoder: number, write_callback_fn: encoder_write_callback_fn, metadata_callback_fn?: metadata_callback_fn, ogg_serial_number?: number | boolean): FLAC__StreamEncoderInitStatus;
/**
 * Initialize the encoder for writing to an OGG container.
 * 
 * @param {number} encoder  the ID of the encoder instance that has not been initialized (or has been reset)
 * @param {encoder_write_callback_fn} write_callback_fn  the callback for writing the encoded Flac data:
 * 				<pre>write_callback_fn(data: Uint8Array, numberOfBytes: Number, samples: Number, currentFrame: Number)</pre>
 * @param {metadata_callback_fn} [metadata_callback_fn]  OPTIONAL
 * 				the callback for the metadata of the encoded Flac data:
 * 				<pre>metadata_callback_fn(metadata: StreamMetadata)</pre>
 * @param {number} [ogg_serial_number]  OPTIONAL
 * 				the serial number for the stream in the OGG container
 * 				DEFAULT: <code>1</code>
 * @returns {FLAC__StreamEncoderInitStatus}  the encoder status (<code>0</code> for <code>FLAC__STREAM_ENCODER_INIT_STATUS_OK</code>)
 */
export function init_encoder_ogg_stream(encoder: number, write_callback_fn: encoder_write_callback_fn, metadata_callback_fn?: metadata_callback_fn, ogg_serial_number?: number): FLAC__StreamEncoderInitStatus;
/**
 * Result / return value for {@link Flac~decoder_read_callback_fn} callback function
 * 
 * @property {TypedArray} buffer  a TypedArray (e.g. Uint8Array) with the read data
 * @property {number} readDataLength  the number of read data bytes. A number of <code>0</code> (zero) indicates that the end-of-stream is reached.
 * @property {boolean} [error]  OPTIONAL value of <code>true</code> indicates that an error occured (decoding will be aborted)
 */
export interface ReadResult {
  /**
   * a TypedArray (e.g. Uint8Array) with the read data
   */
  buffer: TypedArray;
  /**
   * the number of read data bytes. A number of <code>0</code> (zero) indicates that the end-of-stream is reached.
   */
  readDataLength: number;
  /**
   * OPTIONAL value of <code>true</code> indicates that an error occured (decoding will be aborted)
   */
  error?: boolean;
}
/**
 * Result / return value for {@link Flac~decoder_read_callback_fn} callback function for signifying that there is no more data to read
 * 
 * @augments Flac.ReadResult
 * @property {TypedArray | undefined} buffer  a TypedArray (e.g. Uint8Array) with the read data (will be ignored in case readDataLength is <code>0</code>)
 * @property {0} readDataLength  the number of read data bytes: The number of <code>0</code> (zero) indicates that the end-of-stream is reached.
 * @property {boolean} [error]  OPTIONAL value of <code>true</code> indicates that an error occured (decoding will be aborted)
 */
export interface CompletedReadResult {
  /**
   * a TypedArray (e.g. Uint8Array) with the read data (will be ignored in case readDataLength is <code>0</code>)
   */
  buffer: TypedArray | undefined;
  /**
   * the number of read data bytes: The number of <code>0</code> (zero) indicates that the end-of-stream is reached.
   */
  readDataLength: 0;
  /**
   * OPTIONAL value of <code>true</code> indicates that an error occured (decoding will be aborted)
   */
  error?: boolean;
}
/**
 * The callback for reading the FLAC data that will be decoded.
 * 
 * @param {number} numberOfBytes  the maximal number of bytes that the read callback can return
 * @returns {ReadResult | CompletedReadResult}  the result of the reading action/request
 */
export type decoder_read_callback_fn = (numberOfBytes: number) => ReadResult | CompletedReadResult;
/**
 * The callback for writing the decoded FLAC data.
 * 
 * @param {Array<Uint8Array>} data  array of the channels with the decoded PCM data as <code>Uint8Array</code>s
 * @param {BlockMetadata} frameInfo  the metadata information for the decoded data
 */
export type decoder_write_callback_fn = (data: Array<Uint8Array>, frameInfo: BlockMetadata) => void;
/**
 * The callback for reporting decoding errors.
 * 
 * @param {number} errorCode  the error code
 * @param {FLAC__StreamDecoderErrorStatus} errorDescription  the string representation / description of the error
 */
export type decoder_error_callback_fn = (errorCode: number, errorDescription: FLAC__StreamDecoderErrorStatus) => void;
/**
 * FLAC block meta data
 * 
 * @augments Flac.Metadata
 * @property {number} blocksize  the block size (bytes)
 * @property {number} number  the number of the decoded samples or frames
 * @property {string} numberType  the type to which <code>number</code> refers to: either <code>"frames"</code> or <code>"samples"</code>
 * @property {FLAC__ChannelAssignment} channelAssignment  the channel assignment
 * @property {string} crc  the MD5 checksum for the decoded data, if validation is enabled
 * @property {Array<SubFrameMetadata>} [subframes]  the metadata of the subframes. The array length corresponds to the number of channels. NOTE will only be included if {@link Flac.CodingOptions CodingOptions.analyseSubframes} is enabled for the decoder.
 * @property {number} sampleRate  the sample rate (Hz)
 * @property {number} channels  the number of channels
 * @property {number} bitsPerSample  bits per sample
 * @see Flac.CodingOptions
 * @see Flac#setOptions
 */
export interface BlockMetadata {
  /**
   * the block size (bytes)
   */
  blocksize: number;
  /**
   * the number of the decoded samples or frames
   */
  number: number;
  /**
   * the type to which <code>number</code> refers to: either <code>"frames"</code> or <code>"samples"</code>
   */
  numberType: string;
  /**
   * the channel assignment
   */
  channelAssignment: FLAC__ChannelAssignment;
  /**
   * the MD5 checksum for the decoded data, if validation is enabled
   */
  crc: string;
  /**
   * the metadata of the subframes. The array length corresponds to the number of channels. NOTE will only be included if {@link Flac.CodingOptions CodingOptions.analyseSubframes} is enabled for the decoder.
   */
  subframes?: Array<SubFrameMetadata>;
  /**
   * the sample rate (Hz)
   */
  sampleRate: number;
  /**
   * the number of channels
   */
  channels: number;
  /**
   * bits per sample
   */
  bitsPerSample: number;
}
/**
 * FLAC subframe metadata
 * 
 * @property {FLAC__SubframeType} type  the type of the subframe
 * @property {number | FixedSubFrameData | LPCSubFrameData} data  the type specific metadata for subframe
 * @property {number} wastedBits  the wasted bits-per-sample
 */
export interface SubFrameMetadata {
  /**
   * the type of the subframe
   */
  type: FLAC__SubframeType;
  /**
   * the type specific metadata for subframe
   */
  data: number | FixedSubFrameData | LPCSubFrameData;
  /**
   * the wasted bits-per-sample
   */
  wastedBits: number;
}
/**
 * metadata for FIXED subframe type
 * 
 * @property {number} order  The polynomial order.
 * @property {Array<number>} warmup  Warmup samples to prime the predictor, length == order.
 * @property {SubFramePartition} partition  The residual coding method.
 * @property {Array<number>} [residual]  The residual signal, length == (blocksize minus order) samples.
 * 									NOTE will only be included if {@link Flac.CodingOptions CodingOptions.analyseSubframes} is enabled for the decoder.
 */
export interface FixedSubFrameData {
  /**
   * The polynomial order.
   */
  order: number;
  /**
   * Warmup samples to prime the predictor, length == order.
   */
  warmup: Array<number>;
  /**
   * The residual coding method.
   */
  partition: SubFramePartition;
  /**
   * The residual signal, length == (blocksize minus order) samples.
   * 									NOTE will only be included if {@link Flac.CodingOptions CodingOptions.analyseSubframes} is enabled for the decoder.
   */
  residual?: Array<number>;
}
/**
 * metadata for LPC subframe type
 * 
 * @augments Flac.FixedSubFrameData
 * @property {number} order  The FIR order.
 * @property {Array<number>} qlp_coeff  FIR filter coefficients.
 * @property {number} qlp_coeff_precision  Quantized FIR filter coefficient precision in bits.
 * @property {number} quantization_level  The qlp coeff shift needed.
 * @property {Array<number>} warmup  Warmup samples to prime the predictor, length == order.
 * @property {SubFramePartition} partition  The residual coding method.
 * @property {Array<number>} [residual]  The residual signal, length == (blocksize minus order) samples.
 * 									NOTE will only be included if {@link Flac.CodingOptions CodingOptions.analyseSubframes} is enabled for the decoder.
 */
export interface LPCSubFrameData {
  /**
   * The FIR order.
   */
  order: number;
  /**
   * FIR filter coefficients.
   */
  qlp_coeff: Array<number>;
  /**
   * Quantized FIR filter coefficient precision in bits.
   */
  qlp_coeff_precision: number;
  /**
   * The qlp coeff shift needed.
   */
  quantization_level: number;
  /**
   * Warmup samples to prime the predictor, length == order.
   */
  warmup: Array<number>;
  /**
   * The residual coding method.
   */
  partition: SubFramePartition;
  /**
   * The residual signal, length == (blocksize minus order) samples.
   * 									NOTE will only be included if {@link Flac.CodingOptions CodingOptions.analyseSubframes} is enabled for the decoder.
   */
  residual?: Array<number>;
}
/**
 * metadata for FIXED or LPC subframe partitions
 * 
 * @property {FLAC__EntropyCodingMethodType} type  the entropy coding method
 * @property {SubFramePartitionData} data  metadata for a Rice partitioned residual
 */
export interface SubFramePartition {
  /**
   * the entropy coding method
   */
  type: FLAC__EntropyCodingMethodType;
  /**
   * metadata for a Rice partitioned residual
   */
  data: SubFramePartitionData;
}
/**
 * metadata for FIXED or LPC subframe partition data
 * 
 * @property {number} order  The partition order, i.e. # of contexts = 2 ^ order.
 * @property {SubFramePartitionContent} contents  The context's Rice parameters and/or raw bits.
 */
export interface SubFramePartitionData {
  /**
   * The partition order, i.e. # of contexts = 2 ^ order.
   */
  order: number;
  /**
   * The context's Rice parameters and/or raw bits.
   */
  contents: SubFramePartitionContent;
}
/**
 * metadata for FIXED or LPC subframe partition data content
 * 
 * @property {Array<number>} parameters  The Rice parameters for each context.
 * @property {Array<number>} rawBits  Widths for escape-coded partitions. Will be non-zero for escaped partitions and zero for unescaped partitions.
 * @property {number} capacityByOrder  The capacity of the parameters and raw_bits arrays specified as an order, i.e. the number of array elements allocated is 2 ^ capacity_by_order.
 */
export interface SubFramePartitionContent {
  /**
   * The Rice parameters for each context.
   */
  parameters: Array<number>;
  /**
   * Widths for escape-coded partitions. Will be non-zero for escaped partitions and zero for unescaped partitions.
   */
  rawBits: Array<number>;
  /**
   * The capacity of the parameters and raw_bits arrays specified as an order, i.e. the number of array elements allocated is 2 ^ capacity_by_order.
   */
  capacityByOrder: number;
}
/**
 * The types for FLAC subframes
 * 
 * @property {"FLAC__SUBFRAME_TYPE_CONSTANT"} 0  constant signal
 * @property {"FLAC__SUBFRAME_TYPE_VERBATIM"} 1  uncompressed signal
 * @property {"FLAC__SUBFRAME_TYPE_FIXED"} 2  fixed polynomial prediction
 * @property {"FLAC__SUBFRAME_TYPE_LPC"} 3  linear prediction
 */
export type FLAC__SubframeType = 0 | 1 | 2 | 3;
/**
 * The channel assignment for the (decoded) frame.
 * 
 * @property {"FLAC__CHANNEL_ASSIGNMENT_INDEPENDENT"} 0  independent channels
 * @property {"FLAC__CHANNEL_ASSIGNMENT_LEFT_SIDE"} 1  left+side stereo
 * @property {"FLAC__CHANNEL_ASSIGNMENT_RIGHT_SIDE"} 2  right+side stereo
 * @property {"FLAC__CHANNEL_ASSIGNMENT_MID_SIDE"} 3  mid+side stereo
 */
export type FLAC__ChannelAssignment = 0 | 1 | 2 | 3;
/**
 * entropy coding methods
 * 
 * @property {"FLAC__ENTROPY_CODING_METHOD_PARTITIONED_RICE"} 0  Residual is coded by partitioning into contexts, each with it's own 4-bit Rice parameter.
 * @property {"FLAC__ENTROPY_CODING_METHOD_PARTITIONED_RICE2"} 1  Residual is coded by partitioning into contexts, each with it's own 5-bit Rice parameter.
 */
export type FLAC__EntropyCodingMethodType = 0 | 1;
/**
 * Initialize the decoder.
 * 
 * @param {number} decoder  the ID of the decoder instance that has not been initialized (or has been reset)
 * @param {decoder_read_callback_fn} read_callback_fn  the callback for reading the Flac data that should get decoded:
 * 				<pre>read_callback_fn(numberOfBytes: Number) : {buffer: ArrayBuffer, readDataLength: number, error: boolean}</pre>
 * @param {decoder_write_callback_fn} write_callback_fn  the callback for writing the decoded data:
 * 				<pre>write_callback_fn(data: Uint8Array[], frameInfo: Metadata)</pre>
 * @param {decoder_error_callback_fn} error_callback_fn  the error callback:
 * 				<pre>error_callback_fn(errorCode: Number, errorDescription: String)</pre>
 * @param {metadata_callback_fn} [metadata_callback_fn]  OPTIONAL
 * 				callback for receiving the metadata of FLAC data that will be decoded:
 * 				<pre>metadata_callback_fn(metadata: StreamMetadata)</pre>
 * @param {number | boolean} [ogg_serial_number]  OPTIONAL
 * 				if number or <code>true</code> is specified, the decoder will be initilized to
 * 				read from an OGG container, see {@link Flac.init_decoder_ogg_stream}:<br/>
 * 				<code>true</code> will use the default serial number, if specified as number the
 * 				corresponding stream with the serial number from the ogg container will be used.
 * @returns {FLAC__StreamDecoderInitStatus}  the decoder status(<code>0</code> for <code>FLAC__STREAM_DECODER_INIT_STATUS_OK</code>)
 */
export function init_decoder_stream(decoder: number, read_callback_fn: decoder_read_callback_fn, write_callback_fn: decoder_write_callback_fn, error_callback_fn: decoder_error_callback_fn, metadata_callback_fn?: metadata_callback_fn, ogg_serial_number?: number | boolean): FLAC__StreamDecoderInitStatus;
/**
 * Initialize the decoder for writing to an OGG container.
 * 
 * @param {number} decoder  the ID of the decoder instance that has not been initialized (or has been reset)
 * @param {decoder_read_callback_fn} read_callback_fn  the callback for reading the Flac data that should get decoded:
 * 				<pre>read_callback_fn(numberOfBytes: Number) : {buffer: ArrayBuffer, readDataLength: number, error: boolean}</pre>
 * @param {decoder_write_callback_fn} write_callback_fn  the callback for writing the decoded data:
 * 				<pre>write_callback_fn(data: Uint8Array[], frameInfo: Metadata)</pre>
 * @param {decoder_error_callback_fn} error_callback_fn  the error callback:
 * 				<pre>error_callback_fn(errorCode: Number, errorDescription: String)</pre>
 * @param {metadata_callback_fn} [metadata_callback_fn]  OPTIONAL
 * 				callback for receiving the metadata of FLAC data that will be decoded:
 * 				<pre>metadata_callback_fn(metadata: StreamMetadata)</pre>
 * @param {number} [ogg_serial_number]  OPTIONAL
 * 				the serial number for the stream in the OGG container that should be decoded.<br/>
 * 				The default behavior is to use the serial number of the first Ogg page. Setting a serial number here will explicitly specify which stream is to be decoded.
 * @returns {FLAC__StreamDecoderInitStatus}  the decoder status(<code>0</code> for <code>FLAC__STREAM_DECODER_INIT_STATUS_OK</code>)
 */
export function init_decoder_ogg_stream(decoder: number, read_callback_fn: decoder_read_callback_fn, write_callback_fn: decoder_write_callback_fn, error_callback_fn: decoder_error_callback_fn, metadata_callback_fn?: metadata_callback_fn, ogg_serial_number?: number): FLAC__StreamDecoderInitStatus;
/**
 * Encode / submit data for encoding.
 * 
 * This version allows you to supply the input data where the channels are interleaved into a
 * single array (i.e. channel0_sample0, channel1_sample0, ... , channelN_sample0, channel0_sample1, ...).
 * 
 * The samples need not be block-aligned but they must be sample-aligned, i.e. the first value should be
 * channel0_sample0 and the last value channelN_sampleM.
 * 
 * Each sample should be a signed integer, right-justified to the resolution set by bits-per-sample.
 * 
 * For example, if the resolution is 16 bits per sample, the samples should all be in the range [-32768,32767].
 * 
 * 
 * For applications where channel order is important, channels must follow the order as described in the frame header.
 * 
 * @param {number} encoder  the ID of the encoder instance
 * @param {TypedArray} buffer  the audio data in a typed array with signed integers (and size according to the set bits-per-sample setting)
 * @param {number} num_of_samples  the number of samples in buffer
 * @returns {boolean}  true if successful, else false; in this case, check the encoder state with FLAC__stream_encoder_get_state() to see what went wrong.
 */
export function FLAC__stream_encoder_process_interleaved(encoder: number, buffer: TypedArray, num_of_samples: number): boolean;
/**
 * Encode / submit data for encoding.
 * 
 * Submit data for encoding. This version allows you to supply the input data via an array of pointers,
 * each pointer pointing to an array of samples samples representing one channel.
 * The samples need not be block-aligned, but each channel should have the same number of samples.
 * 
 * Each sample should be a signed integer, right-justified to the resolution set by FLAC__stream_encoder_set_bits_per_sample().
 * For example, if the resolution is 16 bits per sample, the samples should all be in the range [-32768,32767].
 * 
 * 
 * For applications where channel order is important, channels must follow the order as described in the frame header.
 * 
 * @param {number} encoder  the ID of the encoder instance
 * @param {Array<TypedArray>} channelBuffers  an array for the audio data channels as typed arrays with signed integers (and size according to the set bits-per-sample setting)
 * @param {number} num_of_samples  the number of samples in one channel (i.e. one of the buffers)
 * @returns {boolean}  true if successful, else false; in this case, check the encoder state with FLAC__stream_encoder_get_state() to see what went wrong.
 */
export function FLAC__stream_encoder_process(encoder: number, channelBuffers: Array<TypedArray>, num_of_samples: number): boolean;
/**
 * Decodes a single frame.
 * 
 * To check decoding progress, use {@link Flac#FLAC__stream_decoder_get_state|FLAC__stream_decoder_get_state}.
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @returns {boolean}  FALSE if an error occurred
 */
export function FLAC__stream_decoder_process_single(decoder: number): boolean;
/**
 * Decodes data until end of stream.
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @returns {boolean}  FALSE if an error occurred
 */
export function FLAC__stream_decoder_process_until_end_of_stream(decoder: number): boolean;
/**
 * Decodes data until end of metadata.
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @returns {boolean}  false if any fatal read, write, or memory allocation error occurred (meaning decoding must stop), else true.
 */
export function FLAC__stream_decoder_process_until_end_of_metadata(decoder: number): boolean;
/**
 * Decoder state code.
 * 
 * @property {"FLAC__STREAM_DECODER_SEARCH_FOR_METADATA"} 0  The decoder is ready to search for metadata
 * @property {"FLAC__STREAM_DECODER_READ_METADATA"} 1  The decoder is ready to or is in the process of reading metadata
 * @property {"FLAC__STREAM_DECODER_SEARCH_FOR_FRAME_SYNC"} 2  The decoder is ready to or is in the process of searching for the frame sync code
 * @property {"FLAC__STREAM_DECODER_READ_FRAME"} 3  The decoder is ready to or is in the process of reading a frame
 * @property {"FLAC__STREAM_DECODER_END_OF_STREAM"} 4  The decoder has reached the end of the stream
 * @property {"FLAC__STREAM_DECODER_OGG_ERROR"} 5  An error occurred in the underlying Ogg layer
 * @property {"FLAC__STREAM_DECODER_SEEK_ERROR"} 6  An error occurred while seeking. The decoder must be flushed with FLAC__stream_decoder_flush() or reset with FLAC__stream_decoder_reset() before decoding can continue
 * @property {"FLAC__STREAM_DECODER_ABORTED"} 7  The decoder was aborted by the read callback
 * @property {"FLAC__STREAM_DECODER_MEMORY_ALLOCATION_ERROR"} 8  An error occurred allocating memory. The decoder is in an invalid state and can no longer be used
 * @property {"FLAC__STREAM_DECODER_UNINITIALIZED"} 9  The decoder is in the uninitialized state; one of the FLAC__stream_decoder_init_*() functions must be called before samples can be processed.
 */
export type FLAC__StreamDecoderState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
/**
 * @param {number} decoder  the ID of the decoder instance
 * @returns {FLAC__StreamDecoderState}  the decoder state
 */
export function FLAC__stream_decoder_get_state(decoder: number): FLAC__StreamDecoderState;
/**
 * Encoder state code.
 * 
 * @property {"FLAC__STREAM_ENCODER_OK"} 0  The encoder is in the normal OK state and samples can be processed.
 * @property {"FLAC__STREAM_ENCODER_UNINITIALIZED"} 1  The encoder is in the uninitialized state; one of the FLAC__stream_encoder_init_*() functions must be called before samples can be processed.
 * @property {"FLAC__STREAM_ENCODER_OGG_ERROR"} 2  An error occurred in the underlying Ogg layer.
 * @property {"FLAC__STREAM_ENCODER_VERIFY_DECODER_ERROR"} 3  An error occurred in the underlying verify stream decoder; check FLAC__stream_encoder_get_verify_decoder_state().
 * @property {"FLAC__STREAM_ENCODER_VERIFY_MISMATCH_IN_AUDIO_DATA"} 4  The verify decoder detected a mismatch between the original audio signal and the decoded audio signal.
 * @property {"FLAC__STREAM_ENCODER_CLIENT_ERROR"} 5  One of the callbacks returned a fatal error.
 * @property {"FLAC__STREAM_ENCODER_IO_ERROR"} 6  An I/O error occurred while opening/reading/writing a file. Check errno.
 * @property {"FLAC__STREAM_ENCODER_FRAMING_ERROR"} 7  An error occurred while writing the stream; usually, the write_callback returned an error.
 * @property {"FLAC__STREAM_ENCODER_MEMORY_ALLOCATION_ERROR"} 8  Memory allocation failed.
 */
export type FLAC__StreamEncoderState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
/**
 * @param {number} encoder  the ID of the encoder instance
 * @returns {FLAC__StreamEncoderState}  the encoder state
 */
export function FLAC__stream_encoder_get_state(encoder: number): FLAC__StreamEncoderState;
/**
 * Direct the decoder to pass on all metadata blocks of type type.
 * 
 * By default, only the STREAMINFO block is returned via the metadata callback.
 * 
 * <p>
 * NOTE: only use on un-initilized decoder instances!
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @param {FLAC__MetadataType} type  the metadata type to be enabled
 * @returns {boolean}  <code>false</code> if the decoder is already initialized, else <code>true</code>
 * @see Flac#FLAC__stream_decoder_set_metadata_respond_all
 */
export function FLAC__stream_decoder_set_metadata_respond(decoder: number, type: FLAC__MetadataType): boolean;
/**
 * Direct the decoder to pass on all APPLICATION metadata blocks of the given id.
 * 
 * By default, only the STREAMINFO block is returned via the metadata callback.
 * 
 * <p>
 * NOTE: only use on un-initilized decoder instances!
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @param {number} id  the ID of application metadata
 * @returns {boolean}  <code>false</code> if the decoder is already initialized, else <code>true</code>
 * @see Flac#FLAC__stream_decoder_set_metadata_respond_all
 */
export function FLAC__stream_decoder_set_metadata_respond_application(decoder: number, id: number): boolean;
/**
 * Direct the decoder to pass on all metadata blocks of any type.
 * 
 * By default, only the STREAMINFO block is returned via the metadata callback.
 * 
 * <p>
 * NOTE: only use on un-initilized decoder instances!
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @returns {boolean}  <code>false</code> if the decoder is already initialized, else <code>true</code>
 * @see Flac#FLAC__stream_decoder_set_metadata_ignore_all
 * @see Flac#FLAC__stream_decoder_set_metadata_respond_application
 * @see Flac#FLAC__stream_decoder_set_metadata_respond
 */
export function FLAC__stream_decoder_set_metadata_respond_all(decoder: number): boolean;
/**
 * Direct the decoder to filter out all metadata blocks of type type.
 * 
 * By default, only the STREAMINFO block is returned via the metadata callback.
 * 
 * <p>
 * NOTE: only use on un-initilized decoder instances!
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @param {FLAC__MetadataType} type  the metadata type to be ignored
 * @returns {boolean}  <code>false</code> if the decoder is already initialized, else <code>true</code>
 * @see Flac#FLAC__stream_decoder_set_metadata_ignore_all
 */
export function FLAC__stream_decoder_set_metadata_ignore(decoder: number, type: FLAC__MetadataType): boolean;
/**
 * Direct the decoder to filter out all APPLICATION metadata blocks of the given id.
 * 
 * By default, only the STREAMINFO block is returned via the metadata callback.
 * 
 * <p>
 * NOTE: only use on un-initilized decoder instances!
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @param {number} id  the ID of application metadata
 * @returns {boolean}  <code>false</code> if the decoder is already initialized, else <code>true</code>
 * @see Flac#FLAC__stream_decoder_set_metadata_ignore_all
 */
export function FLAC__stream_decoder_set_metadata_ignore_application(decoder: number, id: number): boolean;
/**
 * Direct the decoder to filter out all metadata blocks of any type.
 * 
 * By default, only the STREAMINFO block is returned via the metadata callback.
 * 
 * <p>
 * NOTE: only use on un-initilized decoder instances!
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @returns {boolean}  <code>false</code> if the decoder is already initialized, else <code>true</code>
 * @see Flac#FLAC__stream_decoder_set_metadata_respond_all
 * @see Flac#FLAC__stream_decoder_set_metadata_ignore
 * @see Flac#FLAC__stream_decoder_set_metadata_ignore_application
 */
export function FLAC__stream_decoder_set_metadata_ignore_all(decoder: number): boolean;
/**
 * Set the metadata blocks to be emitted to the stream before encoding. A value of NULL, 0 implies no metadata; otherwise, supply an array of pointers to metadata blocks.
 * The array is non-const since the encoder may need to change the is_last flag inside them, and in some cases update seek point offsets. Otherwise, the encoder
 * will not modify or free the blocks. It is up to the caller to free the metadata blocks after encoding finishes.
 * 
 * <p>
 *     The encoder stores only copies of the pointers in the metadata array; the metadata blocks themselves must survive at least until after FLAC__stream_encoder_finish() returns.
 *     Do not free the blocks until then.
 * 
 *     The STREAMINFO block is always written and no STREAMINFO block may occur in the supplied array.
 * 
 *     By default the encoder does not create a SEEKTABLE. If one is supplied in the metadata array, but the client has specified that it does not support seeking,
 *     then the SEEKTABLE will be written verbatim. However by itself this is not very useful as the client will not know the stream offsets for the seekpoints ahead of time.
 *     In order to get a proper seektable the client must support seeking. See next note.
 * 
 *     SEEKTABLE blocks are handled specially. Since you will not know the values for the seek point stream offsets, you should pass in a SEEKTABLE 'template', that is,
 *     a SEEKTABLE object with the required sample numbers (or placeholder points), with 0 for the frame_samples and stream_offset fields for each point.
 *     If the client has specified that it supports seeking by providing a seek callback to FLAC__stream_encoder_init_stream() or both seek AND read callback to
 *      FLAC__stream_encoder_init_ogg_stream() (or by using FLAC__stream_encoder_init*_file() or FLAC__stream_encoder_init*_FILE()), then while it is encoding the encoder will
 *      fill the stream offsets in for you and when encoding is finished, it will seek back and write the real values into the SEEKTABLE block in the stream. There are helper
 *      routines for manipulating seektable template blocks; see metadata.h: FLAC__metadata_object_seektable_template_*(). If the client does not support seeking,
 *      the SEEKTABLE will have inaccurate offsets which will slow down or remove the ability to seek in the FLAC stream.
 * 
 *     The encoder instance will modify the first SEEKTABLE block as it transforms the template to a valid seektable while encoding, but it is still up to the caller to free
 *     all metadata blocks after encoding.
 * 
 *     A VORBIS_COMMENT block may be supplied. The vendor string in it will be ignored. libFLAC will use it's own vendor string. libFLAC will not modify the passed-in
 *     VORBIS_COMMENT's vendor string, it will simply write it's own into the stream. If no VORBIS_COMMENT block is present in the metadata array, libFLAC will write an
 *     empty one, containing only the vendor string.
 * 
 *     The Ogg FLAC mapping requires that the VORBIS_COMMENT block be the second metadata block of the stream. The encoder already supplies the STREAMINFO block automatically.
 * 
 *     If metadata does not contain a VORBIS_COMMENT block, the encoder will supply that too. Otherwise, if metadata does contain a VORBIS_COMMENT block and it is not the first,
 *     the init function will reorder metadata by moving the VORBIS_COMMENT block to the front; the relative ordering of the other blocks will remain as they were.
 * 
 *     The Ogg FLAC mapping limits the number of metadata blocks per stream to 65535. If num_blocks exceeds this the function will return false.
 * 
 * @param {number} encoder  the ID of the encoder instance
 * @param {PointerInfo} metadataBuffersPointer  
 * @param {number} num_blocks  
 * @returns {boolean}  <code>false</code> if the encoder is already initialized, else <code>true</code>. <code>false</code> if the encoder is already initialized, or if num_blocks > 65535 if encoding to Ogg FLAC, else true.
 * @see Flac.FLAC__MetadataType
 * @see Flac#_create_pointer_array
 * @see Flac#_destroy_pointer_array
 */
export function FLAC__stream_encoder_set_metadata(encoder: number, metadataBuffersPointer: PointerInfo, num_blocks: number): boolean;
/**
 * Helper object for allocating an array of buffers on the (memory) heap.
 * 
 * @property {number} pointerPointer  pointer to the array of (pointer) buffers
 * @property {Array<number>} dataPointer  array of pointers to the allocated data arrays (i.e. buffers)
 * @see Flac#_create_pointer_array
 * @see Flac#_destroy_pointer_array
 */
export interface PointerInfo {
  /**
   * pointer to the array of (pointer) buffers
   */
  pointerPointer: number;
  /**
   * array of pointers to the allocated data arrays (i.e. buffers)
   */
  dataPointer: Array<number>;
}
/**
 * Helper function for creating pointer (and allocating the data) to an array of buffers on the (memory) heap.
 * 
 * Use the returned <code>PointerInfo.dataPointer</code> as argument, where the array-pointer is required.
 * 
 * NOTE: afer use, the allocated buffers on the heap need be freed, see {@link Flac#_destroy_pointer_array|_destroy_pointer_array}.
 * 
 * @param {Array<Uint8Array>} bufferArray  the buffer for which to create
 * @returns {PointerInfo}  <code>false</code> if the decoder is already initialized, else <code>true</code>
 * @see Flac#_destroy_pointer_array
 */
export function _create_pointer_array(bufferArray: Array<Uint8Array>): PointerInfo;
/**
 * Helper function for destroying/freeing a previously created pointer (and allocating the data) of an array of buffers on the (memory) heap.
 * 
 * @param {PointerInfo} pointerInfo  the pointer / allocation information that should be destroyed/freed
 * @see Flac#_create_pointer_array
 */
export function _destroy_pointer_array(pointerInfo: PointerInfo): void;
/**
 * Get if MD5 verification is enabled for the decoder
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @returns {boolean}  <code>true</code> if MD5 verification is enabled
 * @see {@link Flac#FLAC__stream_decoder_set_md5_checking|FLAC__stream_decoder_set_md5_checking}
 */
export function FLAC__stream_decoder_get_md5_checking(decoder: number): boolean;
/**
 * Set the "MD5 signature checking" flag. If true, the decoder will compute the MD5 signature of the unencoded audio data while decoding and compare it to the signature from the STREAMINFO block,
 * if it exists, during {@link Flac.FLAC__stream_decoder_finish FLAC__stream_decoder_finish()}.
 * 
 * MD5 signature checking will be turned off (until the next {@link Flac.FLAC__stream_decoder_reset FLAC__stream_decoder_reset()}) if there is no signature in the STREAMINFO block or when a seek is attempted.
 * 
 * Clients that do not use the MD5 check should leave this off to speed up decoding.
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @param {boolean} is_verify  enable/disable checksum verification during decoding
 * @returns {boolean}  FALSE if the decoder is already initialized, else TRUE.
 * @see {@link Flac#FLAC__stream_decoder_get_md5_checking|FLAC__stream_decoder_get_md5_checking}
 */
export function FLAC__stream_decoder_set_md5_checking(decoder: number, is_verify: boolean): boolean;
/**
 * Finish the encoding process.
 * 
 * @param {number} encoder  the ID of the encoder instance
 * @returns {boolean}  <code>false</code> if an error occurred processing the last frame;
 * 					 or if verify mode is set, there was a verify mismatch; else <code>true</code>.
 * 					 If <code>false</code>, caller should check the state with {@link Flac#FLAC__stream_encoder_get_state}
 * 					 for more information about the error.
 */
export function FLAC__stream_encoder_finish(encoder: number): boolean;
/**
 * Finish the decoding process.
 * 
 * The decoder can be reused, after initializing it again.
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @returns {boolean}  <code>false</code> if MD5 checking is on AND a STREAMINFO block was available AND the MD5 signature in
 * 						 the STREAMINFO block was non-zero AND the signature does not match the one computed by the decoder;
 * 						 else <code>true</code>.
 */
export function FLAC__stream_decoder_finish(decoder: number): boolean;
/**
 * Reset the decoder for reuse.
 * 
 * <p>
 * NOTE: Needs to be re-initialized, before it can be used again
 * 
 * @param {number} decoder  the ID of the decoder instance
 * @returns {boolean}  true if successful
 * @see {@link Flac#init_decoder_stream|init_decoder_stream}
 * @see {@link Flac#init_decoder_ogg_stream|init_decoder_ogg_stream}
 */
export function FLAC__stream_decoder_reset(decoder: number): boolean;
/**
 * Delete the encoder instance, and free up its resources.
 * 
 * @param {number} encoder  the ID of the encoder instance
 */
export function FLAC__stream_encoder_delete(encoder: number): void;
/**
 * Delete the decoder instance, and free up its resources.
 * 
 * @param {number} decoder  the ID of the decoder instance
 */
export function FLAC__stream_decoder_delete(decoder: number): void;

export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
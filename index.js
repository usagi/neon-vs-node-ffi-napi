// For benchmarking
const { performance } = require("perf_hooks");

// For marshalling using NEON
const neon = require("./native/index.node");

// For marshalling using node-ffi-napi
const ffi = (() => {
 const ref = require("ref-napi");
 const r_void = ref.types.void;
 const r_f32 = ref.types.float;
 const r_u8 = ref.types.uint8;
 const r_array = require("ref-array-napi");
 const r_u8_array = r_array(r_u8);
 const build = require("./native/artifacts.json").active.endsWith("release")
  ? "release"
  : "debug";
 const p = process.platform.substr(0, 3);
 const cdylib_prefix = p === "win" ? "" : "lib";
 const cdylib__body = "backend";
 const cdylib__ext =
  p === "win" ? "dll" : p === "lin" ? "so" : p === "dar" ? "dylib" : undefined;
 const cdylib_path = `./target/${build}/${cdylib_prefix}${cdylib__body}.${cdylib__ext}`;
 const marshalling_targets = {
  empty: [r_void, []],
  get_unorm_rand_f32: [r_f32, []],
  process_buffer: [r_void, [r_u8_array]]
 };
 return require("ffi-napi").Library(cdylib_path, marshalling_targets);
})();

// The benchmark system
// Note: number_of_generate_per_batch to be clamp in range [0 .. Number.MAX_SAFE_INTEGER]
const runner = (
 name,
 number_of_batch_per_functor,
 functor,
 number_of_generate_per_batch
) => {
 number_of_generate_per_batch = Math.max(
  0,
  Math.min(number_of_generate_per_batch, Number.MAX_SAFE_INTEGER)
 );
 const delta_time_records = new Array(number_of_batch_per_functor);
 for (
  let repeat_counter = 0;
  repeat_counter < number_of_batch_per_functor;
  ++repeat_counter
 ) {
  const start_time = performance.now();

  for (
   let generating_counter = 0;
   generating_counter < number_of_generate_per_batch;
   ++generating_counter
  )
   functor();

  const delta_time = performance.now() - start_time;

  console.log(
   `${name} ( batch-#${repeat_counter} of ${number_of_batch_per_functor} ): ${delta_time} [ms/${number_of_generate_per_batch}-function-calls]`
  );
  delta_time_records[repeat_counter] = delta_time;
 }
 const total_time = delta_time_records.reduce((p, q) => p + q, 0);
 const mathmetical_averate_time_in_ms =
  total_time / number_of_batch_per_functor / number_of_generate_per_batch;
 console.log(
  `Average: ${mathmetical_averate_time_in_ms * 1.0e6} [ns/function-call]\n`
 );
};

// Settings of the benchmarking
const number_of_batch_per_functor = 8;
const number_of_generate_per_batch = 1000;

// Execution
runner(
 "empty/pure-js",
 number_of_batch_per_functor,
 () => {},
 number_of_generate_per_batch
);
runner(
 "empty/neon-rs",
 number_of_batch_per_functor,
 neon.empty,
 number_of_generate_per_batch
);
runner(
 "empty/ffi-napi-cdylib-rs",
 number_of_batch_per_functor,
 ffi.empty,
 number_of_generate_per_batch
);

runner(
 "rng/pure-js",
 number_of_batch_per_functor,
 Math.random,
 number_of_generate_per_batch
);
runner(
 "rng/neon-rs",
 number_of_batch_per_functor,
 neon.get_unorm_rand_f32,
 number_of_generate_per_batch
);
runner(
 "rng/ffi-napi-cdylib-rs",
 number_of_batch_per_functor,
 ffi.get_unorm_rand_f32,
 number_of_generate_per_batch
);

const buffer_size = 32 * 32 * 4;

var abuffer = new ArrayBuffer(buffer_size);
var nbuffer = Buffer.from(abuffer, 0, abuffer.byteLength);

function process_buffer(buffer) {
 for (var index = 0; index < buffer.byteLength; ++index)
  buffer[index] = buffer[index] + 8;
}

runner(
 "buffer/pure-js",
 number_of_batch_per_functor,
 () => process_buffer(abuffer),
 number_of_generate_per_batch
);
runner(
 "buffer/neon-rs",
 number_of_batch_per_functor,
 () => neon.process_buffer(abuffer),
 number_of_generate_per_batch
);
runner(
 "buffer/ffi-napi-cdylib-rs",
 number_of_batch_per_functor,
 () => ffi.process_buffer(nbuffer),
 number_of_generate_per_batch
);

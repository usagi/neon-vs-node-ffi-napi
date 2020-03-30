use neon::prelude::*;

extern crate backend;
use backend::*;

fn neon_empty(mut c: FunctionContext) -> JsResult<JsUndefined> {
 Ok(c.undefined())
}

fn neon_get_unorm_rand_f32(mut c: FunctionContext) -> JsResult<JsNumber> {
 Ok(c.number(get_unorm_rand_f32()))
}

fn neon_process_buffer(mut c: FunctionContext) -> JsResult<JsUndefined> {
 let mut h: Handle<JsArrayBuffer> = c.argument(0)?;

 c.borrow_mut(&mut h, |data| {
  let slice = data.as_mut_slice::<u8>();
  process_buffer(slice);
 });

 Ok(c.undefined())
}

register_module!(mut c, {
 c.export_function("empty", neon_empty)?;
 c.export_function("get_unorm_rand_f32", neon_get_unorm_rand_f32)?;
 c.export_function("process_buffer", neon_process_buffer)
});

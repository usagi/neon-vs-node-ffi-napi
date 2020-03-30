extern crate rand;
use rand::Rng;

#[no_mangle]
pub extern "C" fn empty() {}

#[no_mangle]
pub extern "C" fn get_unorm_rand_f32() -> f32 {
 rand::thread_rng().gen::<f32>()
}

#[no_mangle]
pub extern "C" fn process_buffer(buffer: &mut [u8]) {
 for v in buffer {
  *v = *v + 8u8;
 }
}

#[cfg(test)]
mod tests {
 use super::*;

 #[test]
 fn is_a_returns_in_range_unorm() {
  for _ in 0..1000 {
   let expected_range = 0f32..1f32;
   let actual_value = get_unorm_rand_f32();
   let result = expected_range.contains(&actual_value);
   assert!(result);
  }
 }
}

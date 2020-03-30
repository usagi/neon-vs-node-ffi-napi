# neon-vs-node-ffi-napi

This is a benchmark project of `NEON` vs. `node-ffi-napi` vs. pure-`Node.js`. It's focused to a marshalling cost.

1. The "pure" is: `Node.js` ↺ `Node.js`
2. The "NEON" is: `Node.js` ⇄ `NEON` ⇄ `native code`
3. The "node-ffi-napi" is: `Node.js` ⇄ `node-ffi-napi` ⇄ `native code`

## Usage

```sh
git clone git@github.com:usagi/neon-vs-node-ffi-napi.git
cd neon-vs-node-ffi-napi
yarn start
```

## A result

|        | pure        | NEON        | node-ffi-napi |
| ------ | ----------- | ----------- | ------------- |
| empty  | 47.92550206 | 128.3124983 | 5800.287876   |
| rng    | 35.47475487 | 175.1873791 | 5176.462751   |
| buffer | 175394.375  | 534.950003  | 59332.4       |

Unit: `[ns/function-call]`; See also "Main codes" section.

There are two important points these are the marshalling cost comparison and the useful usage. These individual values are not important.

1. You may not need a native codes and a marshallings if you want to use only lightweight implements. Maybe, a marshalling cost be over than native code advantage.
2. You should use `NEON` if you want speedup mainly with a native code. Unfortunately, `node-ffi-napi` is so slow.
3. You may need a native code and a marshallings if you need to operate buffers such as `ArrayBuffer`.

Note: This result scored in 2020-03-31. Using Threadripper 2990WX machine.

## Main codes

- [index.js](index.js) ... Benchmarking code, pure `Node.js` implements, `node-ffi-napi` marshalling part.
- [native/src/lib.rs](native/src/lib.rs) ... `NEON` marshalling part.
- [workspace.rs/backend/src/lib.rs](workspace.rs/backend/src/lib.rs) ... backend pure `Rust` implements.

## License

MIT

## Author

USAGI.NETWORK / Usagi Ito <https://usagi.network/>

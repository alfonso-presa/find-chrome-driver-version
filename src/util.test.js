const { safe, safeAsync, asyncToIo } = require('./util');
const { head, identity } = require('ramda');
const either = require('crocks/pointfree/either');
const get = either(identity, identity);
const Async = require('crocks/Async');

test('safe should wrap insecure function with undefined values in either context', () => {
	const errorMessage = (xs) => `${JSON.stringify(xs)}: empty array don't have head`;
	const safeHead = safe(errorMessage, head);
	expect(get(safeHead([]))).toEqual(`[]: empty array don't have head`);
	expect(get(safeHead([ 'x' ]))).toEqual('x');
});

test('safe should wrap insecure function with try/cath errors in either context', () => {
	const errorMessage = (x) => `Error parsing string: ${x}`;
	const safeParse = safe(errorMessage, JSON.parse);

	expect(get(safeParse(`{ "a": 1 }`))).toEqual({ a: 1 });
	expect(get(safeParse(`x {}`))).toEqual('Error parsing string: x {}');
});

test('safeAsync should wrap insecure function with undefined values in Async context', async () => {
	const errorMessage = (xs) => `${JSON.stringify(xs)}: empty array don't have head`;
	const safeHead = safeAsync(errorMessage, head);

	expect(await safeHead([]).toPromise().catch(identity)).toEqual(`[]: empty array don't have head`);
	expect(await safeHead([ 'x' ]).toPromise()).toEqual('x');
});

test('safeAsync should wrap insecure function with try/cath errors in either context', async () => {
	const errorMessage = (x) => `Error parsing string: ${x}`;
	const safeParse = safeAsync(errorMessage, JSON.parse);

	expect(await safeParse(`{ "a": 1 }`).toPromise()).toEqual({ a: 1 });
	expect(await safeParse(`x {}`).toPromise().catch(identity)).toEqual('Error parsing string: x {}');
});

test.skip('asyncToIO should transform (a -> Async Error b) into (a -> IO b)', () => {
	const asyncIdentity = (x) => Async((_, resolve) => setTimeout(() => resolve(x), 0));
	const ioIdentity = asyncToIo(asyncIdentity);
	expect(ioIdentity(1).run()).toEqual(1);
});

import { assert } from 'chai';
import { groupBy, firstNWords, nWordsModels } from '../model-detection';
describe('model-detection', () => {

    describe('firstNWords', () => {
        it('should return 1st N words, N from 0 to 3', () => {
            const variantToTest = 'toto tata titi tonton toutou tati bubu';
            assert.equal(firstNWords(variantToTest, 1), 'toto');
            assert.equal(firstNWords(variantToTest, 2), 'toto tata');
            assert.equal(firstNWords(variantToTest, 3), 'toto tata titi');
        });
    
        it('should return null if no words', () => {
            const variantToTest = 'titi tata';
            assert.equal(firstNWords(variantToTest, 0), null);
        });

        it('should return null if to many words', () => {
            const variantToTest = 'titi tata';
            assert.equal(firstNWords(variantToTest, 3), null);
        });
    });

    describe('groupBy', () => {
        it('should init detect if map is empty', () => {
            const result = groupBy({}, 'toto', s => firstNWords(s, 1));
            assert.deepEqual(result, { 'toto': [ 'toto' ] });
        });
    
        it('should detect if array does have matching group', () => {
            const result = groupBy({ 'tutu': ['tutu toto'] }, 'tutu', s => firstNWords(s, 1));
            assert.deepEqual(result, { 'tutu': ['tutu toto', 'tutu'] });
        });
        
        it('should detect if array does have matching group ignoring case', () => {
            const result = groupBy({ 'tutu': ['tutu toto'] }, 'TUTU', s => firstNWords(s, 1));
            assert.deepEqual(result, { 'tutu': ['tutu toto', 'TUTU'] });
        });

        it('should detect if array does not have matching group', () => {
            const result = groupBy({'tutu': ['tutu toto'] }, 'toto', s => firstNWords(s, 1));
            assert.deepEqual(result, { 'tutu': ['tutu toto'], 'toto': ['toto'] });
        });
    });

    describe('nWordsModels', () => {
        it('should group variants with at least 1 common word at the beginning', () => {
            const variants = ['206 xsi', '205 gti', '306 xs', '206 rc', '306 16s'];
            const result = nWordsModels(variants, 1);
            assert.deepEqual(result, { '205': ['205 gti'], '206': ['206 rc', '206 xsi'], '306': ['306 16s', '306 xs'] });
        });

        it('should group variants with at least 2 common words at the beginning', () => {
            const variants = ['clio II RS', 'clio II 16s', 'Clio II 1.9d', 'clio III rs'];
            const result = nWordsModels(variants, 2);
            assert.deepEqual(result, { 'clio ii': ['Clio II 1.9d', 'clio II 16s', 'clio II RS'], 'clio iii': ['clio III rs'] });
        });
    });
});



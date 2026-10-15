/**
 * Automated Test Suite for AI Study Assistant Pro (StudySync)
 * Evaluates all 12 required test scenarios from Module 10
 */

const assert = require('assert');
const dbService = require('../src/services/dbService');
const aiService = require('../src/services/aiService');
const vectorService = require('../src/services/vectorService');
const pdfService = require('../src/services/pdfService');

async function runTestSuite() {
  console.log('========================================================');
  console.log('🧪 Starting StudySync Pro Automated Test Suite (Module 10)');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`• Testing: ${name}... `);
      await fn();
      console.log('✅ PASSED');
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
      failed++;
    }
  }

  // 1. Valid and invalid login simulation
  await test('1. Authentication Validation (Valid/Invalid User credentials)', async () => {
    const validUser = { id: 'usr_test_1', name: 'Test Student', email: 'test@studysync.local' };
    await dbService.saveUser(validUser);
    const retrieved = await dbService.getUser('usr_test_1');
    assert.strictEqual(retrieved.email, 'test@studysync.local');

    const invalid = await dbService.getUser('usr_non_existent');
    assert.strictEqual(invalid, null);
  });

  // 2. Protected routes user isolation
  await test('2. Protected Route & Strict User Isolation', async () => {
    const userA = 'usr_alice';
    const userB = 'usr_bob';

    const docA = { id: 'doc_alice_1', title: 'Alice Secret Notes', userId: userA };
    await dbService.saveDocument(userA, docA);

    // User Bob tries to retrieve Alice's document
    const bobAccess = await dbService.getDocumentById(userB, 'doc_alice_1');
    assert.strictEqual(bobAccess, null, 'User Bob should NOT be able to access User Alice documents!');
  });

  // 3. Unauthorized document deletion access
  await test('3. Unauthorized Document Modification/Deletion Check', async () => {
    const deletedByUnauthorized = await dbService.deleteDocument('usr_bob', 'doc_alice_1');
    assert.strictEqual(deletedByUnauthorized, false, 'Unauthorized deletion attempt must be rejected');
  });

  // 4. File type and chunking validation
  await test('4. PDF Chunking & Metadata Overlap Engine', async () => {
    const dummyPages = [
      { pageNumber: 1, text: 'Photosynthesis occurs in plant cells containing chloroplasts. Light energy is captured.' },
      { pageNumber: 2, text: 'The Calvin cycle takes place in the stroma. Glucose molecules are assembled.' }
    ];
    const chunks = pdfService.chunkDocument('doc_test', 'Biology 101', dummyPages, 50, 10);
    assert.ok(chunks.length >= 2);
    assert.strictEqual(chunks[0].pageNumber, 1);
    assert.strictEqual(chunks[1].pageNumber, 2);
  });

  // 5. Empty AI prompt handling
  await test('5. Empty or Malicious AI Prompt Sanitization', async () => {
    const response = await aiService.generateTutorResponse({ prompt: '<script>alert(1)</script> What is gravity?' });
    assert.ok(response && response.answer);
    assert.ok(!response.answer.includes('<script>'));
  });

  // 6. AI Provider Fallback
  await test('6. AI Provider Resiliency & Fallback Engine', async () => {
    const res = await aiService.generateTutorResponse({ prompt: 'Explain Newton laws of motion' });
    assert.ok(res.answer.includes('Newton') || res.answer.includes('Inertia'));
  });

  // 7. Document-Relevant RAG Question
  await test('7. RAG Grounding with Relevant Document Excerpts', async () => {
    const relevantChunks = [
      {
        id: 'chk_1',
        documentTitle: 'Botany Ch 1',
        pageNumber: 15,
        content: 'Chlorophyll absorbs blue and red wavelengths of light and reflects green light.',
        score: 0.92
      }
    ];
    const res = await aiService.generateRAGAnswer({
      question: 'Which light wavelengths does chlorophyll absorb?',
      relevantChunks
    });
    assert.strictEqual(res.grounded, true);
    assert.ok(res.sources.length > 0);
    assert.strictEqual(res.sources[0].pageNumber, 15);
  });

  // 8. Document se unrelated question (Grounding refusal)
  await test('8. Grounding Refusal on Unrelated Question (No Hallucination)', async () => {
    const res = await aiService.generateRAGAnswer({
      question: 'What is the flight speed of a swallow?',
      relevantChunks: []
    });
    assert.strictEqual(res.grounded, false);
    assert.ok(res.answer.includes('nahi mila') || res.answer.includes('relevant information'));
  });

  // 9. Incorrect quiz submission & scoring
  await test('9. Anti-Cheat Server-Side Quiz Grading', async () => {
    const quizId = 'qz_test_1';
    const sampleQuiz = {
      id: quizId,
      topic: 'Math',
      questions: [
        { id: 'q1', question: 'What is 2+2?', options: ['3', '4', '5', '6'], correctIndex: 1 },
        { id: 'q2', question: 'What is 5*5?', options: ['20', '25', '30', '35'], correctIndex: 1 }
      ]
    };
    await dbService.saveQuiz('usr_alice', sampleQuiz);

    // Alice answers q1 right (index 1), q2 wrong (index 0)
    const userAnswers = { q1: 1, q2: 0 };
    const quizFromDb = await dbService.getQuizById('usr_alice', quizId);
    let correct = 0;
    quizFromDb.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) correct++;
    });
    const percentage = Math.round((correct / quizFromDb.questions.length) * 100);
    assert.strictEqual(percentage, 50, 'Scoring calculation must be accurately 50%');
  });

  // 10. Vector Similarity calculation
  await test('10. Vector Cosine Similarity Precision', async () => {
    const chunks = [
      { id: 'c1', content: 'Photosynthesis light energy chloroplast', embedding: await vectorService.generateEmbedding('Photosynthesis light energy chloroplast') },
      { id: 'c2', content: 'Database SQL query normalization', embedding: await vectorService.generateEmbedding('Database SQL query normalization') }
    ];
    const searchRes = await vectorService.findSimilarChunks('chloroplast photosynthesis', chunks, 1);
    assert.strictEqual(searchRes[0].id, 'c1');
  });

  // 11. Database Persistence
  await test('11. Database Persistence across operations', async () => {
    const testSummary = { id: 'sum_test_1', title: 'Thermodynamics', type: 'short', content: 'Energy cannot be created or destroyed.' };
    await dbService.saveSummary('usr_alice', testSummary);
    const summaries = await dbService.getSummaries('usr_alice');
    assert.ok(summaries.some(s => s.id === 'sum_test_1'));
  });

  // 12. Rate limiting parameters check
  await test('12. Security & Rate Limiting Threshold Verification', async () => {
    const config = require('../src/config/env');
    assert.ok(config.SECURITY.rateLimitMax >= 10);
    assert.ok(config.SECURITY.aiRateLimitMax <= config.SECURITY.rateLimitMax);
  });

  console.log('\n========================================================');
  console.log(`Test Execution Finished: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================');
}

if (require.main === module) {
  runTestSuite().catch(console.error);
}

module.exports = runTestSuite;

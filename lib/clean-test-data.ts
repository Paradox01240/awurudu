import { query } from './database-clean';

/**
 * Clean up all test data from the database
 * This removes all candidates, voters, votes, and resets the voting session
 */
export async function cleanTestData() {
  try {
    console.log('Cleaning up test data...');

    // Delete all votes first (due to foreign key constraints)
    await query('DELETE FROM votes');
    console.log('Deleted all votes');

    // Delete all voters
    await query('DELETE FROM voters');
    console.log('Deleted all voters');

    // Delete all candidates
    await query('DELETE FROM candidates');
    console.log('Deleted all candidates');

    // Reset voting session
    await query(`
      UPDATE voting_session 
      SET totalVotes = 0, 
          isActive = false, 
          startTime = NULL, 
          endTime = NULL 
      WHERE id = 'main_session'
    `);
    console.log('Reset voting session');

    console.log('Test data cleanup completed successfully');
    return true;
  } catch (error) {
    console.error('Error cleaning test data:', error);
    throw error;
  }
}

/**
 * Check if database has test data
 */
export async function hasTestData() {
  try {
    const candidatesResult = await query('SELECT COUNT(*) as count FROM candidates');
    const votersResult = await query('SELECT COUNT(*) as count FROM voters');
    const votesResult = await query('SELECT COUNT(*) as count FROM votes');

    const candidateCount = parseInt(candidatesResult.rows[0]?.count || '0');
    const voterCount = parseInt(votersResult.rows[0]?.count || '0');
    const voteCount = parseInt(votesResult.rows[0]?.count || '0');

    return {
      hasData: candidateCount > 0 || voterCount > 0 || voteCount > 0,
      candidateCount,
      voterCount,
      voteCount
    };
  } catch (error) {
    console.error('Error checking test data:', error);
    return {
      hasData: false,
      candidateCount: 0,
      voterCount: 0,
      voteCount: 0
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const candidatesResult = await query('SELECT COUNT(*) as count FROM candidates');
    const votersResult = await query('SELECT COUNT(*) as count FROM voters');
    const votesResult = await query('SELECT COUNT(*) as count FROM votes');
    const sessionResult = await query('SELECT * FROM voting_session WHERE id = \'main_session\'');

    const stats = {
      candidates: parseInt(candidatesResult.rows[0]?.count || '0'),
      voters: parseInt(votersResult.rows[0]?.count || '0'),
      votes: parseInt(votesResult.rows[0]?.count || '0'),
      session: sessionResult.rows[0] || null
    };

    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      candidates: 0,
      voters: 0,
      votes: 0,
      session: null
    };
  }
}

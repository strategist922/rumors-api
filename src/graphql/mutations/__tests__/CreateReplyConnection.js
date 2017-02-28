import gql from 'util/GraphQL';
import { loadFixtures, unloadFixtures } from 'util/fixtures';
import client from 'util/client';
import MockDate from 'mockdate';
import fixtures from '../__fixtures__/CreateReplyConnection';

describe('CreateReplyConnection', () => {
  beforeAll(() => loadFixtures(fixtures));

  it('connects article and reply together', async () => {
    MockDate.set(1485593157011);
    const { data, errors } = await gql`
      mutation(
        $articleId: String!
        $replyId: String!
      ) {
        CreateReplyConnection(
          articleId: $articleId
          replyId: $replyId
        ) {
          id
        }
      }
    `({
      articleId: 'createReplyConnection1',
      replyId: 'createReplyConnection2',
    }, { userId: 'test', from: 'test' });
    MockDate.reset();

    expect(errors).toBeUndefined();

    const conn = await client.get({ index: 'replyconnections', type: 'basic', id: data.CreateReplyConnection.id });
    expect(conn._source).toMatchSnapshot();

    const article = await client.get({ index: 'articles', type: 'basic', id: 'createReplyConnection1' });
    expect(article._source.replyConnectionIds[0]).toBe(data.CreateReplyConnection.id);

    // Cleanup
    await client.delete({ index: 'replyconnections', type: 'basic', id: data.CreateReplyConnection.id });
    await client.update({
      index: 'articles',
      type: 'basic',
      id: 'createReplyConnection1',
      body: {
        doc: fixtures['/articles/basic/createReplyConnection1'],
      },
    });
  });

  afterAll(() => unloadFixtures(fixtures));
});
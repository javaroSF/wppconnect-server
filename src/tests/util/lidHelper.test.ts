import {
  formatContactForLid,
  sendMessageWithLidRetry,
} from '../../util/lidHelper';

describe('LID helpers', () => {
  it('preserves an explicitly supplied LID', () => {
    expect(formatContactForLid('966531581602@lid')).toBe('966531581602@lid');
  });

  it('keeps a bare phone number in PN form by default', () => {
    expect(formatContactForLid('966531581602')).toBe('966531581602@c.us');
  });

  it('does not retry an unrelated WA-JS runtime error as a LID fallback', async () => {
    const send = jest
      .fn()
      .mockRejectedValue(
        new Error('n.UserPrefs.getMeLidUserOrThrow is not a function')
      );

    await expect(
      sendMessageWithLidRetry(send, '966531581602@c.us', 'test')
    ).rejects.toThrow('UserPrefs.getMeLidUserOrThrow');

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      '966531581602@c.us',
      'test',
      expect.any(Object)
    );
  });
});

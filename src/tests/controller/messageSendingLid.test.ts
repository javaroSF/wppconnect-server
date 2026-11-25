import { sendMessage } from '../../controller/messageController';

function createResponse() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

function createRequest(overrides: Record<string, unknown> = {}) {
  return {
    body: { phone: ['966531581602@c.us'], message: 'test' },
    client: { sendText: jest.fn() },
    io: { emit: jest.fn() },
    logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    recipientSendTrace: [
      {
        originalRecipient: '966531581602',
        normalizedRecipient: '966531581602@c.us',
        resolvedRecipient: '966531581602@c.us',
        isLidExplicitlySupplied: false,
      },
    ],
    ...overrides,
  } as any;
}

describe('sendMessage LID handling', () => {
  it('sends a normal PN without converting it to a LID', async () => {
    const req = createRequest();
    req.client.sendText.mockResolvedValue({
      id: 'message-id',
      to: '966531581602@c.us',
      chatId: '966531581602@c.us',
      ack: 1,
      isSendFailure: false,
    });
    const res = createResponse();

    await sendMessage(req, res as any);

    expect(req.client.sendText).toHaveBeenCalledWith(
      '966531581602@c.us',
      'test',
      {}
    );
    expect(req.logger.info).toHaveBeenCalledWith(
      'Message send attempt',
      expect.objectContaining({
        originalRecipient: '966531581602',
        identifierUsed: '966531581602@c.us',
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('keeps an explicit LID unchanged', async () => {
    const req = createRequest({
      body: { phone: ['249920194252@lid'], message: 'test' },
      recipientSendTrace: [
        {
          originalRecipient: '249920194252@lid',
          normalizedRecipient: '249920194252@lid',
          isLidExplicitlySupplied: true,
        },
      ],
    });
    req.client.sendText.mockResolvedValue({ to: '249920194252@lid' });
    const res = createResponse();

    await sendMessage(req, res as any);

    expect(req.client.sendText).toHaveBeenCalledWith(
      '249920194252@lid',
      'test',
      {}
    );
  });

  it('uses only a resolved LID after WhatsApp explicitly requests one', async () => {
    const req = createRequest();
    req.client.sendText
      .mockRejectedValueOnce(new Error('No LID for user'))
      .mockResolvedValueOnce({ to: '142962449195172@lid' });
    req.client.getPnLidEntry = jest.fn().mockResolvedValue({
      lid: { _serialized: '142962449195172@lid' },
    });
    const res = createResponse();

    await sendMessage(req, res as any);

    expect(req.client.getPnLidEntry).toHaveBeenCalledWith('966531581602@c.us');
    expect(
      req.client.sendText.mock.calls.map((call: unknown[]) => call[0])
    ).toEqual(['966531581602@c.us', '142962449195172@lid']);
  });

  it('does not use PN-to-LID fallback for a WA-JS runtime compatibility error', async () => {
    const req = createRequest();
    req.client.sendText.mockRejectedValue(
      new Error('n.UserPrefs.getMeLidUserOrThrow is not a function')
    );
    req.client.getPnLidEntry = jest.fn();
    const res = createResponse();

    await sendMessage(req, res as any);

    expect(req.client.sendText).toHaveBeenCalledTimes(1);
    expect(req.client.getPnLidEntry).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        response: [
          expect.objectContaining({
            error: true,
            contact: '966531581602@c.us',
            message: expect.stringContaining('UserPrefs.getMeLidUserOrThrow'),
          }),
        ],
      })
    );
  });

  it('continues per-recipient handling for a multi-recipient request', async () => {
    const req = createRequest({
      body: {
        phone: ['966531581602@c.us', '249920194252@lid'],
        message: 'test',
      },
      recipientSendTrace: [
        {
          originalRecipient: '966531581602',
          normalizedRecipient: '966531581602@c.us',
          isLidExplicitlySupplied: false,
        },
        {
          originalRecipient: '249920194252@lid',
          normalizedRecipient: '249920194252@lid',
          isLidExplicitlySupplied: true,
        },
      ],
    });
    req.client.sendText
      .mockRejectedValueOnce(new Error('recipient unavailable'))
      .mockResolvedValueOnce({ to: '249920194252@lid' });
    const res = createResponse();

    await sendMessage(req, res as any);

    expect(
      req.client.sendText.mock.calls.map((call: unknown[]) => call[0])
    ).toEqual(['966531581602@c.us', '249920194252@lid']);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        response: [
          expect.objectContaining({ error: true }),
          { to: '249920194252@lid' },
        ],
      })
    );
  });
});

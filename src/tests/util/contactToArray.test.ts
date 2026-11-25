/*
 * Copyright 2026 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { contactToArray } from '../../util/functions';

describe('contactToArray', () => {
  it('keeps an explicit LID suffix instead of rewriting it as a phone number', () => {
    expect(contactToArray('267000387@lid')).toEqual(['267000387@lid']);
    expect(contactToArray('267000000387@lid')).toEqual(['267000000387@lid']);
    expect(contactToArray(['267000387@lid'])).toEqual(['267000387@lid']);
  });

  it('keeps an explicit suffix that the length heuristic would reclassify', () => {
    expect(contactToArray('8865623215244578@g.us')).toEqual([
      '8865623215244578@g.us',
    ]);
    expect(contactToArray('120363111111111111@newsletter')).toEqual([
      '120363111111111111@newsletter',
    ]);
    expect(contactToArray('5511999999999@c.us')).toEqual([
      '5511999999999@c.us',
    ]);
  });

  it('still derives the domain from the flags', () => {
    expect(contactToArray('8865623215244578', true)).toEqual([
      '8865623215244578@g.us',
    ]);
    expect(contactToArray('120363111111111111', false, true)).toEqual([
      '120363111111111111@newsletter',
    ]);
    expect(contactToArray('267000387', false, false, true)).toEqual([
      '267000387@lid',
    ]);
  });

  it('lets an explicit flag win over a conflicting suffix', () => {
    expect(contactToArray('8865623215244578@g.us', true)).toEqual([
      '8865623215244578@g.us',
    ]);
    expect(contactToArray('267000387@lid', false, false, true)).toEqual([
      '267000387@lid',
    ]);
  });

  it('keeps bare numbers as phone numbers unless LID is explicit', () => {
    expect(contactToArray('5511999999999')).toEqual(['5511999999999@c.us']);
    expect(contactToArray('267000000387012')).toEqual(['267000000387012@c.us']);
  });

  it('ignores an unrecognised suffix instead of propagating it', () => {
    expect(contactToArray('5511999999999@example.com')).toEqual([
      '5511999999999@c.us',
    ]);
  });

  it('supports comma and semicolon separated strings', () => {
    expect(contactToArray('5511999999999; 267000387@lid')).toEqual([
      '5511999999999@c.us',
      '267000387@lid',
    ]);
  });

  it('drops empty entries and tolerates a trailing separator', () => {
    expect(contactToArray(['5511999999999', '', '@lid'])).toEqual([
      '5511999999999@c.us',
    ]);
    expect(contactToArray('5511999999999,')).toEqual(['5511999999999@c.us']);
  });

  it('strips formatting characters from non group contacts', () => {
    // Formatted phone numbers remain phone numbers. Flowz performs PN/LID
    // resolution explicitly instead of guessing based on identifier length.
    expect(contactToArray('+55 (11) 99999-9999')).toEqual([
      '55 11 999999999@c.us',
    ]);
  });
});

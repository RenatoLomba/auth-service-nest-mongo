import { Document } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class RefreshToken {
  @Prop()
  token: string;

  @Prop()
  user_id: string;

  @Prop({ default: new Date() })
  created_at: Date;

  @Prop()
  expires_at: Date;
}

export type RefreshTokenDocument = RefreshToken & Document;

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

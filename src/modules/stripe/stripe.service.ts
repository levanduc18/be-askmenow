import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { CONFIG_KEYS } from '@/common/constants/config-keys.const';
import { StripeConfig } from '@/config/types/stripe-config.interface';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private stripeConfig: StripeConfig;

  constructor(private configService: ConfigService) {
    this.stripeConfig = configService.get<StripeConfig>(CONFIG_KEYS.STRIPE, { infer: true });
    this.stripe = new Stripe(this.stripeConfig.secretKey, {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createCheckoutSession() {
    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 5000,
            product_data: { name: 'Sample Product' },
          },
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.configService.getOrThrow<string>(this.stripeConfig.webhookSecret),
    );
  }
}

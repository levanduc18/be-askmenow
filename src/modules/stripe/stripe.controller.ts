import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { Request, Response } from 'express';

import { Public } from '@/modules/auth/passport/is-public.decorator';
import { StripeService } from '@/modules/stripe/stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async createCheckout(@Res() res: Response) {
    const session = await this.stripeService.createCheckoutSession();
    res.json({ url: session.url });
  }

  @Public()
  @Post('webhook')
  handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = this.stripeService.verifyWebhookSignature((req as any).rawBody, signature);
      if (event.type === 'checkout.session.completed') {
        console.log('✅ Payment successful!');
      }

      res.status(200).send('Webhook received');
    } catch (err) {
      console.error('❌ Webhook error:', err.message);
      res.status(400).send('Webhook error');
    }
  }
}

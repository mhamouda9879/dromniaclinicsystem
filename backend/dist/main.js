"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`\n📡 API Endpoints:`);
    console.log(`   Health: http://localhost:${port}/telegram/health`);
    console.log(`   Test: http://localhost:${port}/telegram/test`);
    console.log(`   Bot Info: http://localhost:${port}/telegram/bot-info`);
    console.log(`   Webhook Info: http://localhost:${port}/telegram/webhook-info`);
    console.log(`\n💡 Run 'npm run test:telegram' to test your Telegram bot configuration\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map
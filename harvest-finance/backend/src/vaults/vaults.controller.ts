import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { VaultsService } from './vaults.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DepositFundsCommand } from './cqrs/commands/deposit-funds.command';
import { WithdrawFundsCommand } from './cqrs/commands/withdraw-funds.command';
import { GetVaultBalanceQuery } from './cqrs/queries/get-vault-balance.query';
import { GetVaultTransactionsQuery } from './cqrs/queries/get-vault-transactions.query';
import { DepositDto } from './dto/deposit.dto';
import {
  DepositVaultResponseDto,
  VaultResponseDto,
} from './dto/vault-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Vaults')
@Controller({
  path: 'vaults',
  version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VaultsController {
  constructor(
    private readonly vaultsService: VaultsService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(':vaultId/deposit')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deposit funds into a vault' })
  @ApiParam({
    name: 'vaultId',
    description: 'Vault ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: DepositDto })
  @ApiResponse({
    status: 200,
    description: 'Deposit successful',
    type: DepositVaultResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid amount or vault capacity',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Vault not found' })
  async depositToVault(
    @Param('vaultId') vaultId: string,
    @Body() depositDto: DepositDto,
    @Request() req: any,
  ): Promise<DepositVaultResponseDto> {
    const secureDepositDto = { ...depositDto, userId: req.user.id };
    return this.commandBus.execute(
      new DepositFundsCommand(vaultId, secureDepositDto.userId, secureDepositDto.amount, secureDepositDto.idempotencyKey),
    );
  }

  @Post(':vaultId/withdraw')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw funds from a vault' })
  @ApiParam({
    name: 'vaultId',
    description: 'Vault ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { amount: { type: 'number', example: 100 } },
    },
  })
  @ApiResponse({ status: 200, description: 'Withdrawal successful' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid amount or insufficient balance',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Vault not found' })
  async withdrawFromVault(
    @Param('vaultId') vaultId: string,
    @Body('amount') amount: number,
    @Request() req: any,
  ): Promise<any> {
    return this.commandBus.execute(new WithdrawFundsCommand(vaultId, req.user.id, amount));
  }

  @Get(':vaultId/balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get vault balance (optionally user-specific)' })
  async getVaultBalance(
    @Param('vaultId') vaultId: string,
    @Request() req: any,
  ): Promise<any> {
    const userId = req.user ? req.user.id : undefined;
    return this.queryBus.execute(new GetVaultBalanceQuery(vaultId, userId));
  }

  @Get(':vaultId/transactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get recent vault transactions' })
  async getVaultTransactions(
    @Param('vaultId') vaultId: string,
    @Query('limit') limit = '50',
  ): Promise<any> {
    const n = parseInt(limit, 10) || 50;
    return this.queryBus.execute(new GetVaultTransactionsQuery(vaultId, n));
  }

  @Get('my-vaults')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all vaults for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'User vaults retrieved successfully',
    type: [VaultResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  async getMyVaults(@Request() req: any): Promise<VaultResponseDto[]> {
    return this.vaultsService.getUserVaults(req.user.id);
  }

  @Get(':vaultId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get vault by ID' })
  @ApiParam({
    name: 'vaultId',
    description: 'Vault ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Vault retrieved successfully',
    type: VaultResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Vault not found' })
  async getVaultById(
    @Param('vaultId') vaultId: string,
  ): Promise<VaultResponseDto> {
    const vault = await this.vaultsService.getVaultById(vaultId);
    return this.vaultsService.mapVaultToResponse(vault);
  }

  @Get('public')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all public vaults' })
  @ApiResponse({
    status: 200,
    description: 'Public vaults retrieved successfully',
    type: [VaultResponseDto],
  })
  async getPublicVaults(): Promise<VaultResponseDto[]> {
    return this.vaultsService.getPublicVaults();
  }

  @Get('metadata')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get vault metadata (names, symbols, asset pairs)' })
  @ApiResponse({
    status: 200,
    description: 'Vault metadata retrieved successfully',
  })
  async getVaultsMetadata(): Promise<any[]> {
    return this.vaultsService.getVaultsMetadata();
  }

  @Get('apy-history')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get APY history for vaults' })
  @ApiResponse({
    status: 200,
    description: 'APY history retrieved successfully',
  })
  async getApyHistory(
    @Query('vaultId') vaultId?: string,
    @Query('timeRange') timeRange: string = '30d',
  ): Promise<any[]> {
    return this.vaultsService.getApyHistory(vaultId, timeRange);
  }
}

import axios, { AxiosInstance } from "axios";
import { Account, createPublicClient, formatEther, parseEther, formatUnits, http, weiUnits, toHex } from "viem";
import { base } from "viem/chains";

import config from "../config";
import { privateKeyToAccount } from "viem/accounts";
import chalk from "chalk";
import { randomUUID } from "crypto";

const MIN_BALANCE = 100;

class TenderlyClient {
    private static instance: TenderlyClient;
    private httpClient: AxiosInstance;
    private rpcUrl: string | null = null;
    private dynamicRpcUrls: boolean = false;;

    constructor() {
        this.httpClient = axios.create({
            baseURL: `https://api.tenderly.co/api/v1/account/${config.tenderly.accountName}/project/${config.tenderly.projectName}`,
            headers: {
                "X-Access-Key": config.tenderly.accessKey,
            },
        });

        if (config.tenderly.rpc) {
            this.rpcUrl = config.tenderly.rpc;
        } else {
            this.dynamicRpcUrls = true;
        }
    }

    public static getClientForRpcUrl(rpcUrl: string) {
        return createPublicClient({ chain: base, transport: http(rpcUrl) });
    }

    static getFacilitatorAccount(): Account {
        return privateKeyToAccount(config.facilitatorPrivateKey);
    }

    async getVirtualTestnets() {
        const response = await this.httpClient.get("/vnets");
        return response.data;
    }

    async createVirtualTestnet() {
        const response = await this.httpClient.post("/vnets", {
            slug: randomUUID(),
            fork_config: {
                network_id: base.id,
            },
            virtual_network_config: {
                chain_config: {
                    chain_id: base.id,
                },
            },
            sync_state_config: {
                enabled: false,
            },
        });
        return response.data;
    }

    getPublicRpcFromVnet(vnet: any): string { 
        return vnet.rpcs.find((rpc: any) => rpc.name === "Admin RPC").url;
    }

    setRpcUrl(rpcUrl: string) {
        console.log(chalk.yellow("Setting RPC URL:"), rpcUrl);
        this.rpcUrl = rpcUrl;
    }

    async fundWallet(client: any, address: string, amount: number) {
        const fundAmount = amount * 100;
        const result = await client.request({
            method: "tenderly_addBalance",
            params: [
                [
                    address,
                ],
                toHex(parseEther(fundAmount.toString())),
            ],
        });

        console.log(chalk.yellow("Funded wallet:"), address, "with", fundAmount, "ETH");

        return result;
    }

    async checkIfTestnetIsSetup() {
        let _rpcUrl = this.rpcUrl;

        if (!_rpcUrl && this.dynamicRpcUrls) {
            // create vnet
            console.log(chalk.yellow("No RPC URL provided"));
            console.log(chalk.magenta("[Tenderly Client] Fetching available Virtual TestNets"));

            const vnets = await this.getVirtualTestnets();

            let vnet = null;

            if (vnets.length === 0) {
                console.log(chalk.yellow("No Virtual TestNets found"));
                
                console.log(chalk.magenta("[Tenderly Client] Creating new Virtual TestNet"));

                vnet = await this.createVirtualTestnet();

                console.log(chalk.yellow("Virtual TestNet created:"), vnet.slug);

            } else {
                vnet = vnets[0];

                console.log(chalk.yellow("Loaded Virtual TestNet:"), vnet.slug);
            }

            _rpcUrl = this.getPublicRpcFromVnet(vnet);

            this.setRpcUrl(_rpcUrl);
        } else if (!_rpcUrl) {
            return false;
        }

        const client = TenderlyClient.getClientForRpcUrl(_rpcUrl!);

        const balance = await client.getBalance({
            address: config.facilitatorAddress,
        });

        if (parseFloat(formatEther(balance)) < MIN_BALANCE) {
            console.log(chalk.yellow(`Facilitator balance is less than ${MIN_BALANCE}ETH`));

            await this.fundWallet(client, config.facilitatorAddress, MIN_BALANCE);
        } else {
            console.log(chalk.yellow("Facilitator has sufficient balance:"), formatEther(balance), "ETH");
        }
    }

    public static initialize() {
        this.instance = new TenderlyClient();
    }

    public static getInstance() {
        if (!this.instance) {
            throw new Error("TenderlyClient not initialized");
        }

        return this.instance;
    }
}

export default TenderlyClient;
import { parseExperiment } from './experiment.ts';

export const EXAMPLE_COMPARISON = 'Synthetic example: treatment / control';

/** Invented measurements for learning the workflow, never scientific evidence. */
export function createExampleExperiment() {
  const changed = [
    ['APOE', 2.1, 0.008], ['ABCA1', -1.8, 0.012], ['ABCG1', 1.6, 0.018],
    ['APOA1', 1.4, 0.024], ['APOB', -1.3, 0.03], ['LDLR', 1.2, 0.04],
    ['LRP1', -1.7, 0.015], ['LPL', 2.3, 0.009], ['LIPC', -1.1, 0.035],
    ['LIPG', 1.5, 0.02], ['SCARB1', -1.4, 0.028], ['TREM2', 1.9, 0.022],
  ];
  const background = `ACTB GAPDH B2M RPLP0 RPL3 RPL4 RPL5 RPL6 RPL7 RPL8 RPL9 RPL10
RPL11 RPL12 RPL13 RPL14 RPL15 RPL18 RPL19 RPL21 RPL22 RPL23 RPL24 RPL26
RPS2 RPS3 RPS4X RPS5 RPS6 RPS7 RPS8 RPS9 RPS10 RPS11 RPS12 RPS13
RPS14 RPS15 RPS16 RPS17 RPS18 RPS19 RPS20 RPS21 RPS23 RPS24 RPS25 RPS26
RPS27 RPS28 RPS29 UBA52 UBB UBC HSPA8 HSP90AA1 HSP90AB1 HSPD1 HSPB1 PPIA
PGK1 ENO1 ALDOA TPI1 PKM LDHA GPI PFKP HK1 HK2 G6PD TALDO1
TKT IDH1 IDH2 ACO2 CS MDH1 MDH2 SDHA SDHB FH DLAT DLD
PDHA1 PDHB ATP5F1A ATP5F1B ATP5F1C ATP5F1D ATP5F1E NDUFS1 NDUFS2 NDUFS3 NDUFV1 NDUFV2
COX4I1 COX5A COX5B COX6A1 CYCS UQCRC1 UQCRC2 TFRC FTH1 FTL SOD1 SOD2`.split(/\s+/u);
  const records = [
    'gene,log2FoldChange,padj,data_kind',
    ...changed.map((row) => `${row.join(',')},synthetic`),
    ...background.map((gene, index) => `${gene},${(index % 7 - 3) / 10},${0.2 + (index % 8) / 10},synthetic`),
  ];
  return { ...parseExperiment(records.join('\n'), 'synthetic-rnaseq-example.csv'), isSynthetic: true as const };
}

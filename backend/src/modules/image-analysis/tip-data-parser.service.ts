import { Injectable } from '@nestjs/common';
import { TipCategory } from '../tipps/enums/tip.enums';

export interface ParsedTipData {
  // Meccs információk
  matchName?: string;
  matchDate?: string;
  matchTime?: string;

  // Tipp információk
  tipCategory?: TipCategory;
  outcome?: string;
  odds?: number;
  totalOdds?: number;
  stake?: number;
  confidence?: number;

  // Időzítés
  submissionDeadline?: string;

  // Metadata
  rawText: string;
  extractedEntities: string[];
  confidence_score: number; // 0-1 közötti érték
}

@Injectable()
export class TipDataParserService {
  /**
   * Fő parsing funkció - elemzi az OCR szöveget és kinyeri a tipp adatokat
   */
  parseTipData(ocrText: string): ParsedTipData {
    const cleanText = this.cleanText(ocrText);
    console.log('Parsing tip data from text:', cleanText.substring(0, 300));

    const result: ParsedTipData = {
      rawText: cleanText,
      extractedEntities: [],
      confidence_score: 0,
    };

    // Különböző parsing stratégiák alkalmazása
    this.extractMatchInfo(cleanText, result);
    this.extractOdds(cleanText, result);
    this.extractStakeAndConfidence(cleanText, result);
    this.extractTipCategory(cleanText, result);
    this.extractOutcome(cleanText, result);
    this.extractDateTime(cleanText, result);

    // Confidence score kiszámítása
    result.confidence_score = this.calculateConfidenceScore(result);

    console.log('Parsed tip data:', result);
    return result;
  }

  /**
   * Szöveg tisztítása és normalizálása
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,:\-/]/g, '') // Speciális karakterek eltávolítása
      .trim()
      .toLowerCase();
  }

  /**
   * Meccs információk kinyerése
   */
  private extractMatchInfo(text: string, result: ParsedTipData): void {
    // Tipikus meccs név pattern-ek
    const matchPatterns = [
      /(?:meccs|match|mérkőzés)[\s:]*([a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+(?:vs?|against|ellen)[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]+)/i,
      /([a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]{3,}\s*vs?\s*[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]{3,})/i,
      /([a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]{3,}\s*-\s*[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]{3,})/i,
    ];

    for (const pattern of matchPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.matchName = this.normalizeMatchName(match[1] || match[0]);
        result.extractedEntities.push('matchName');
        break;
      }
    }
  }

  /**
   * Odds kinyerése
   */
  private extractOdds(text: string, result: ParsedTipData): void {
    // Odds pattern-ek
    const oddsPatterns = [
      /(?:odds?|szorzó|kurz)[\s:]*(\d+[.,]\d+)/i,
      /(?:@|szorzó)[\s]*(\d+[.,]\d+)/i,
      /(\d+[.,]\d+)(?:\s*odds?)/i,
      /(\d+[.,]\d+)(?:\s*szorzó)/i,
    ];

    for (const pattern of oddsPatterns) {
      const match = text.match(pattern);
      if (match) {
        const oddsStr = match[1].replace(',', '.');
        const odds = parseFloat(oddsStr);
        if (odds >= 1.01 && odds <= 100) {
          // Reális odds tartomány
          result.odds = odds;
          result.totalOdds = odds; // Egyelőre ugyanaz
          result.extractedEntities.push('odds');
        }
        break;
      }
    }
  }

  /**
   * Tét és bizalom kinyerése
   */
  private extractStakeAndConfidence(text: string, result: ParsedTipData): void {
    // Tét pattern-ek
    const stakePatterns = [/(?:tét|stake|fogadás)[\s:]*(\d+)/i, /(\d+)(?:\s*(?:ft|huf|eur|usd))/i];

    for (const pattern of stakePatterns) {
      const match = text.match(pattern);
      if (match) {
        const stake = parseInt(match[1]);
        if (stake > 0 && stake <= 1000000) {
          // Reális tét tartomány
          result.stake = stake;
          result.extractedEntities.push('stake');
        }
        break;
      }
    }

    // Bizalom pattern-ek
    const confidencePatterns = [
      /(?:bizalom|confidence|magabiztosság)[\s:]*(\d+)/i,
      /(\d+)(?:\s*(?:%|percent|százalék))/i,
      /(?:biztosság|biztos)[\s:]*(\d+)/i,
    ];

    for (const pattern of confidencePatterns) {
      const match = text.match(pattern);
      if (match) {
        let confidence = parseInt(match[1]);
        if (confidence > 5) confidence = Math.min(confidence / 20, 5); // % -> 1-5 skála
        if (confidence >= 1 && confidence <= 5) {
          result.confidence = confidence;
          result.extractedEntities.push('confidence');
        }
        break;
      }
    }
  }

  /**
   * Tipp kategória kinyerése
   */
  private extractTipCategory(text: string, result: ParsedTipData): void {
    const categoryKeywords = {
      [TipCategory.SINGLE_BET]: ['single', 'egyszerű', 'alap', 'szimpla'],
      [TipCategory.MULTI_BET]: ['combo', 'kombinált', 'multi', 'több'],
      [TipCategory.SYSTEM_BET]: ['system', 'rendszer', 'bankers'],
      [TipCategory.LIVE_BET]: ['live', 'élő', 'running', 'futó'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          result.tipCategory = category as TipCategory;
          result.extractedEntities.push('tipCategory');
          return;
        }
      }
    }

    // Default: single bet
    result.tipCategory = TipCategory.SINGLE_BET;
  }

  /**
   * Kimenetel kinyerése
   */
  private extractOutcome(text: string, result: ParsedTipData): void {
    const outcomePatterns = [
      /(?:kimenetel|eredmény|outcome)[\s:]*([^\n\r.]{5,50})/i,
      /(?:tipp|bet)[\s:]*([^\n\r.]{5,50})/i,
      /(home|away|draw|1|x|2|over|under|goals|gól)/i,
    ];

    for (const pattern of outcomePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.outcome = match[1].trim();
        result.extractedEntities.push('outcome');
        break;
      }
    }
  }

  /**
   * Dátum és idő kinyerése
   */
  private extractDateTime(text: string, result: ParsedTipData): void {
    // Dátum pattern-ek
    const datePatterns = [
      /(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})/,
      /(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/,
      /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec).*?\d{4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.matchDate = this.normalizeDateString(match[1]);
        result.extractedEntities.push('matchDate');
        break;
      }
    }

    // Idő pattern-ek
    const timePatterns = [/(\d{1,2}:\d{2})/, /(\d{1,2}[.]\d{2})/];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.matchTime = match[1].replace('.', ':');
        result.extractedEntities.push('matchTime');
        break;
      }
    }
  }

  /**
   * Meccs név normalizálása
   */
  private normalizeMatchName(name: string): string {
    return name
      .replace(/\s+/g, ' ')
      .replace(/vs?|against|ellen/i, ' vs ')
      .trim();
  }

  /**
   * Dátum string normalizálása
   */
  private normalizeDateString(dateStr: string): string {
    // Itt lehetne komplexebb dátum parsing logika
    return dateStr.trim();
  }

  /**
   * Confidence score kiszámítása
   */
  private calculateConfidenceScore(result: ParsedTipData): number {
    const totalPossibleFields = 8; // matchName, odds, stake, confidence, outcome, tipCategory, matchDate, matchTime
    const extractedFields = result.extractedEntities.length;

    let score = extractedFields / totalPossibleFields;

    // Súlyozott pontszám - fontosabb mezők
    if (result.extractedEntities.includes('odds')) score += 0.2;
    if (result.extractedEntities.includes('matchName')) score += 0.15;
    if (result.extractedEntities.includes('outcome')) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Automatikus validálás a kinyert adatokon
   */
  validateParsedData(data: ParsedTipData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Kötelező mezők ellenőrzése
    if (!data.matchName || data.matchName.length < 5) {
      errors.push('Meccs név nem található vagy túl rövid');
    }

    if (!data.odds || data.odds < 1.01) {
      errors.push('Érvényes odds nem található');
    }

    if (!data.outcome || data.outcome.length < 2) {
      errors.push('Tipp kimenete nem azonosítható');
    }

    // Confidence score ellenőrzése
    if (data.confidence_score < 0.3) {
      errors.push('Alacsony bizalmi szint a képelemzés során');
    }

    return { isValid: true, errors: [] };
  }
}

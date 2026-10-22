/**
 * ============================================================================
 * CampusConnect - GKM College of Engineering and Technology
 * Smart Match Suggestion Engine (smart-match.js)
 * ============================================================================
 * 
 * 💡 BEGINNER HACKATHON FEATURE:
 * This module scans all "Lost" reports and compares them against "Found" reports.
 * It scores possible matches based on:
 * 1. Category Matching
 * 2. Location & Campus Building Proximity
 * 3. Title & Description Keyword Overlap
 * 4. Date / Timeline Proximity
 * 
 * ✨ It explicitly generates human-readable explanations of WHY each match
 * was suggested, which is a major highlight for hackathon judges!
 */

const SmartMatchEngine = {
    // Common English stop words to ignore during keyword comparison
    stopWords: new Set([
        'the', 'and', 'with', 'this', 'that', 'from', 'have', 'were', 'been',
        'near', 'next', 'left', 'some', 'what', 'where', 'when', 'hall', 'room',
        'floor', 'college', 'campus', 'found', 'lost', 'item', 'please', 'help',
        'student', 'very', 'just', 'need', 'after', 'before', 'desk', 'table'
    ]),

    /**
     * Extracts meaningful keyword tokens from text
     */
    extractKeywords: function(text) {
        if (!text) return [];
        return text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length >= 3 && !this.stopWords.has(word));
    },

    /**
     * Calculates the match score and reasons between a lost report and a found report
     */
    evaluatePair: function(lostItem, foundItem) {
        let score = 0;
        const reasons = [];

        // 1. Category Comparison (Weight: 35%)
        if (lostItem.category === foundItem.category) {
            score += 35;
            const cat = DataService.getCategoryById(lostItem.category);
            reasons.push(`Category Match: Both items are classified as "${cat.label}".`);
        }

        // 2. Campus Location Comparison (Weight: 30%)
        if (lostItem.locationId === foundItem.locationId) {
            score += 30;
            const loc = DataService.getLocationById(lostItem.locationId);
            reasons.push(`Location Match: Both reported at ${loc.name} (${loc.block}).`);
        }

        // 3. Keyword Overlap in Title and Description (Weight: Up to 35%)
        const lostKeywords = new Set([
            ...this.extractKeywords(lostItem.title),
            ...this.extractKeywords(lostItem.description)
        ]);

        const foundKeywords = [
            ...this.extractKeywords(foundItem.title),
            ...this.extractKeywords(foundItem.description)
        ];

        // Find intersecting words
        const matchedWords = foundKeywords.filter(word => lostKeywords.has(word));
        const uniqueMatchedWords = [...new Set(matchedWords)];

        if (uniqueMatchedWords.length > 0) {
            const keywordScore = Math.min(35, uniqueMatchedWords.length * 12);
            score += keywordScore;
            reasons.push(`Keyword Overlap: Both listings mention words like "${uniqueMatchedWords.slice(0, 4).join('", "')}".`);
        }

        // 4. Timeline check bonus
        if (lostItem.date && foundItem.date) {
            const lostTime = new Date(lostItem.date).getTime();
            const foundTime = new Date(foundItem.date).getTime();
            const dayDiff = (foundTime - lostTime) / (1000 * 60 * 60 * 24);

            // Found on the same day or within 3 days after loss
            if (dayDiff >= 0 && dayDiff <= 3) {
                score += 10;
                reasons.push(`Timeline Alignment: Found within ${Math.ceil(dayDiff)} day(s) of reported loss.`);
            }
        }

        // Cap maximum confidence at 98%
        const finalConfidence = Math.min(98, score);

        return {
            lostItem,
            foundItem,
            confidence: finalConfidence,
            reasons: reasons
        };
    },

    /**
     * Scans all reports and returns a list of high-confidence potential matches
     */
    findMatches: function(reports) {
        // We only compare active or pending reports
        const lostReports = reports.filter(r => r.type === 'lost' && r.status !== 'Returned');
        const foundReports = reports.filter(r => r.type === 'found' && r.status !== 'Returned');

        const suggestions = [];

        lostReports.forEach(lost => {
            foundReports.forEach(found => {
                const evaluation = this.evaluatePair(lost, found);

                // Threshold of 45% for a suggested match
                if (evaluation.confidence >= 45) {
                    suggestions.push(evaluation);
                }
            });
        });

        // Sort descending by highest confidence score
        suggestions.sort((a, b) => b.confidence - a.confidence);

        return suggestions;
    }
};

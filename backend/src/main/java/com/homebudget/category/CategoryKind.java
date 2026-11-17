package com.homebudget.category;

/** How a category's money behaves across months. */
public enum CategoryKind {
    /** Przepływowa: per month; what is not spent does not carry over. */
    FLOW,
    /** Narastająca: accumulates month to month until spent. */
    CUMULATIVE
}
